const KEY = "mein-budget-v1";
const categories = ["Wohnen","Lebensmittel","Transport","Freizeit","Abos","Shopping","Gesundheit","Sonstiges"];
const icons = {Wohnen:"🏠", Lebensmittel:"🛒", Transport:"🚗", Freizeit:"🎉", Abos:"💳", Shopping:"🛍️", Gesundheit:"💚", Sonstiges:"📦"};

let state = JSON.parse(localStorage.getItem(KEY) || '{"transactions":[]}');
let currentType = "expense";

const $ = id => document.getElementById(id);
const money = n => `CHF ${Number(n).toLocaleString("de-CH",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const pad = n => String(n).padStart(2,"0");
const today = new Date();
const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
let selectedMonth = todayStr.slice(0,7);

function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
function monthName(ym){
  const [y,m]=ym.split("-").map(Number);
  return new Intl.DateTimeFormat("de-CH",{month:"long",year:"numeric"}).format(new Date(y,m-1,1));
}
function formatDate(s){ return new Intl.DateTimeFormat("de-CH",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(s+"T12:00:00")); }

function render(){
  $("monthTitle").textContent = monthName(selectedMonth);
  const txs = state.transactions.filter(t => t.date.startsWith(selectedMonth));
  const income = txs.filter(t=>t.type==="income").reduce((a,t)=>a+t.amount,0);
  const expense = txs.filter(t=>t.type==="expense").reduce((a,t)=>a+t.amount,0);
  $("income").textContent = money(income);
  $("expense").textContent = money(expense);
  $("balance").textContent = money(income-expense);
  renderCategories(txs);
  renderTransactions(txs);
  renderMonthFilter();
}

function renderCategories(txs){
  const rows = categories.map(c=>{
    const amount = txs.filter(t=>t.type==="expense" && t.category===c).reduce((a,t)=>a+t.amount,0);
    return {c,amount};
  }).filter(x=>x.amount>0).sort((a,b)=>b.amount-a.amount);
  if(!rows.length){ $("categories").innerHTML='<div class="empty">Noch keine Ausgaben in diesem Monat.</div>'; return; }
  const max = rows[0].amount;
  $("categories").innerHTML = rows.map(x=>`
    <div class="cat-row">
      <div class="cat-name">${icons[x.c]||"📦"} ${x.c}</div>
      <div class="cat-meta"><strong>${money(x.amount)}</strong></div>
      <div class="cat-bar"><div class="cat-fill" style="width:${(x.amount/max)*100}%"></div></div>
    </div>`).join("");
}

function renderTransactions(txs){
  const sorted=[...txs].sort((a,b)=>b.date.localeCompare(a.date) || b.created-a.created);
  if(!sorted.length){ $("transactions").innerHTML='<div class="empty">Noch keine Transaktionen.<br>Füge deine erste Einnahme oder Ausgabe hinzu.</div>'; return; }
  $("transactions").innerHTML=sorted.map(t=>`
    <div class="tx">
      <div class="tx-icon">${t.type==="income"?"💰":icons[t.category]||"📦"}</div>
      <div class="tx-main">
        <div class="tx-note">${escapeHtml(t.note || t.category)}</div>
        <div class="tx-sub">${t.type==="income"?"Einnahme":t.category} · ${formatDate(t.date)}</div>
      </div>
      <div class="tx-amount ${t.type}">${t.type==="income"?"+":"−"}${money(t.amount).replace("CHF ","CHF ")}</div>
      <button class="delete" title="Löschen" data-delete="${t.id}">×</button>
    </div>`).join("");
  document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{
    if(confirm("Diese Transaktion löschen?")){
      state.transactions=state.transactions.filter(t=>t.id!==b.dataset.delete); save(); render();
    }
  });
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }

function renderMonthFilter(){
  const months=new Set(state.transactions.map(t=>t.date.slice(0,7)));
  months.add(todayStr.slice(0,7));
  const list=[...months].sort().reverse();
  $("monthFilter").innerHTML=list.map(m=>`<option value="${m}" ${m===selectedMonth?"selected":""}>${monthName(m)}</option>`).join("");
}

function openDialog(type){
  currentType=type;
  $("entryType").value=type;
  $("dialogTitle").textContent=type==="income"?"Einnahme hinzufügen":"Ausgabe hinzufügen";
  $("category").parentElement.style.display=type==="income"?"none":"flex";
  $("amount").value="";
  $("note").value="";
  $("date").value=todayStr;
  $("entryDialog").showModal();
  setTimeout(()=>$("amount").focus(),50);
}

document.querySelectorAll(".action").forEach(b=>b.onclick=()=>openDialog(b.dataset.type));
$("closeDialog").onclick=()=>$("entryDialog").close();
$("monthFilter").onchange=e=>{ selectedMonth=e.target.value; render(); };

$("entryForm").onsubmit=e=>{
  e.preventDefault();
  const amount=Number($("amount").value);
  if(!amount || amount<=0) return;
  state.transactions.push({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    type:currentType, amount,
    category:currentType==="expense"?$("category").value:"Einnahme",
    date:$("date").value,
    note:$("note").value.trim(),
    created:Date.now()
  });
  save(); $("entryDialog").close(); selectedMonth=$("date").value.slice(0,7); render();
};

$("clearBtn").onclick=()=>{
  if(confirm("Wirklich ALLE gespeicherten Transaktionen löschen?")){
    state={transactions:[]}; save(); selectedMonth=todayStr.slice(0,7); render();
  }
};

render();
