# Deployment auf Coolify

`kitech-software.de` läuft produktiv über die selbstgehostete Coolify-Instanz auf
diesem VPS (`http://coolify.kitech-software.de`, intern `http://localhost:8000`).
Kein Lovable, kein Netlify mehr – vollständig migriert.

## Aktueller Stand

- **VPS-IP:** `87.106.200.173`
- **Application:** Projekt "KITech Website" → Application `KITech-Webseite`
- **Domains:** `https://kitech-software.de`, `https://www.kitech-software.de`
  (SSL via Let's Encrypt/Traefik, automatisch)
- **DNS:** A-Records für `@` und `www` zeigen auf die VPS-IP.
- **Build:** Dockerfile im Projekt-Root + `deploy/nginx.conf` +
  `deploy/security-headers.conf` (SPA-Fallback, Gzip, Security-Header).
- **Auto-Deploy:** GitHub-App-Integration in Coolify eingerichtet
  (Settings → Sources). Bei Problemen: Application → Tab "Webhooks" →
  manuellen Webhook mit Secret als Fallback einrichten.

## Neues Deployment / Redeploy

Push auf `main` sollte automatisch deployen. Falls nicht: Coolify-Dashboard →
Application → **Redeploy**.

## Environment-Variablen

Reine statische SPA – `VITE_*`-Variablen müssen zur **Build-Zeit** gesetzt werden
(Coolify: "Build-Time Variables"), nicht als Runtime-Env.

## QA-Ergebnis (lokal verifiziert)

- `docker build -f Dockerfile .` → erfolgreich.
- SPA-Fallback, Gzip, Security-Header (HSTS, CSP, X-Frame-Options etc.) im
  Testcontainer bestätigt.
