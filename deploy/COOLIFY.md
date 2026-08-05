# Deployment auf Coolify

`kitech-software.de` läuft produktiv über die selbstgehostete Coolify-Instanz auf
diesem VPS (`http://coolify.kitech-software.de`, intern `http://localhost:8000`).

## Aktueller Stand

- **VPS-IP:** `87.106.200.173`
- **Application:** Projekt "KITech Website" → Application `KITech-Webseite`
- **Domains:** `https://kitech-software.de`, `https://www.kitech-software.de`
  (SSL via Let's Encrypt/Traefik, automatisch)
- **DNS:** A-Records für `@` und `www` zeigen auf die VPS-IP.

## ⚠️ Umstellung nötig: Nixpacks → Dockerfile

Seit dem Umzug von Vite auf **Next.js** ist die Seite **keine statische SPA mehr**.
Sie braucht zur Laufzeit einen Node-Server — genau deshalb liefert sie fertiges
HTML an Suchmaschinen aus.

Vor dem nächsten Deploy in Coolify umstellen:

| Einstellung | Alt | Neu |
|---|---|---|
| Build Pack | `nixpacks` (Caddy) | **`dockerfile`** |
| Port | 80 | **3000** |

Das `Dockerfile` im Projekt-Root ist darauf ausgelegt (Multi-Stage, Next.js
`output: "standalone"`, läuft als nicht-privilegierter Nutzer `nextjs`).

`deploy/nginx.conf` und `deploy/security-headers.conf` sind **entfallen**: Die
Security-Header setzt jetzt `next.config.ts` per `headers()`. Damit gelten sie
unabhängig davon, womit deployt wird — vorher waren sie faktisch nie aktiv, weil
Caddy die nginx-Konfiguration gar nicht gelesen hat.

## Zwei Domains aus einem Deployment

Seit dem 31.07.2026 bedient dasselbe Projekt zwei Domains:

| Domain | Inhalt |
|---|---|
| `kitech-software.de` | öffentliche Marketing-Seiten, statisch vorgerendert |
| `app.kitech-software.de` | eingeloggter Bereich mit `/auth` (LogTo) |

Das Host-Routing macht `src/proxy.ts`: Kommt der Request auf der App-Domain an,
wird intern auf das Segment `/app/*` umgeschrieben (Rewrite, kein Redirect — die
Adresszeile bleibt).

**In Coolify:** Beide Domains auf **dieselbe** Application zeigen lassen
(Domains-Feld, kommagetrennt). Es braucht keinen zweiten Container.
DNS: A-Record für `app` auf die VPS-IP.

## ⚠️ LogTo braucht eine Domain mit TLS

Der LogTo-Container antwortet aktuell nur über **HTTP** auf einer
sslip.io-Adresse. Solange das so ist, darf der Login nicht live gehen — Nutzer
würden ihre Passwörter unverschlüsselt übertragen.

Nötig: eigene Domain (z. B. `auth.kitech-software.de`) mit Let's-Encrypt-Zertifikat,
danach `LOGTO_ENDPOINT` entsprechend setzen.

**Reihenfolge beachten:** Der Issuer steckt in jedem ausgestellten Token. Ein
Domainwechsel nach dem ersten echten Login invalidiert alle bestehenden Sessions.

## Environment-Variablen

Next.js statt Vite: Client-seitig sichtbare Variablen brauchen das Präfix
**`NEXT_PUBLIC_`** (vorher `VITE_`). Vorlage siehe `.env.example`.

Wichtig — die beiden Arten nicht verwechseln:

| Art | Beispiele | Wo setzen |
|---|---|---|
| `NEXT_PUBLIC_*` | `NEXT_PUBLIC_APP_URL` | **Build-Time Variables** (werden ins Bundle eingebacken) |
| Server-only | alle `LOGTO_*` | **Runtime**-Variablen |

Die `LOGTO_*` dürfen **kein** `NEXT_PUBLIC_`-Präfix bekommen — sonst landen
`LOGTO_APP_SECRET` und `LOGTO_COOKIE_SECRET` im Client-Bundle und sind öffentlich
lesbar. Sie werden bewusst zur Laufzeit gelesen, damit der Docker-Build sie nicht
braucht.

`.env` gehört **nicht** ins Repository (steht seit 31.07.2026 in `.gitignore`).

## Neues Deployment / Redeploy

Kein verlässlicher Auto-Deploy per GitHub-Webhook (mehrfach als defekt
verifiziert). Deploys laufen manuell über die Coolify-API
(`GET /deploy?uuid=...`) oder das Dashboard → Application → **Redeploy** —
nach explizitem Go, nicht automatisch nach jedem Push.

## Lokal prüfen

```bash
npm run build        # erzeugt .next/ inkl. standalone-Server
npx next start -p 8099   # Produktionsserver lokal
curl -I http://localhost:8099/   # Security-Header prüfen
```
