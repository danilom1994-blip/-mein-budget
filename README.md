# Mein Budget – erste Version

## Testen
Die App besteht nur aus HTML/CSS/JavaScript und benötigt keine Installation.
Zum lokalen Testen einen einfachen Webserver verwenden, z.B.:
python3 -m http.server 8000

Dann im Browser http://localhost:8000 öffnen.

## Veröffentlichung
Die Dateien können z.B. auf GitHub Pages, Netlify, Vercel oder einem anderen HTTPS-Webserver veröffentlicht werden.
HTTPS ist für die installierbare PWA und den Service Worker wichtig.

## Datenschutz der Version 1
Transaktionen werden ausschließlich im Browser per localStorage gespeichert.
Es gibt noch keinen Login und keine Cloud-Synchronisation.
Für eine öffentliche Mehrbenutzer-Version muss als nächster Schritt ein Backend (z.B. Supabase) ergänzt werden.
