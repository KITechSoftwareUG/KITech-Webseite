# Deployment auf Coolify

Diese Datei beschreibt, wie `kitech-software.de` produktiv ueber die
bestehende Coolify-Instanz auf diesem VPS (`http://localhost:8000`)
ausgeliefert wird - statt wie bisher ueber Lovable-Hosting.

Die technischen Voraussetzungen (Dockerfile, `deploy/nginx.conf`,
`.dockerignore`) sind bereits im Repo vorhanden und lokal getestet
(siehe Abschnitt "QA-Ergebnis" unten). Die folgenden Schritte
erfordern Coolify- bzw. DNS-/Registrar-Zugangsdaten und muessen manuell
vom Auftraggeber ausgefuehrt werden.

## 1. Neue Application in Coolify anlegen

1. Coolify-Dashboard oeffnen (`http://localhost:8000`, bzw. die
   oeffentlich erreichbare Coolify-URL/Domain, falls eingerichtet).
2. Neues **Project** (oder bestehendes KITech-Projekt verwenden) ->
   **+ Add Resource** -> **Application**.
3. **Source**: Git Repository -> GitHub verbinden/auswaehlen ->
   dieses Repository (`KITech-Webseite`) auswaehlen.
4. **Branch**: `main`.
5. **Build Pack**: `Dockerfile` auswaehlen.
   - Dockerfile-Pfad: `./Dockerfile` (Projekt-Root, Default).
   - Docker Build Context: Projekt-Root (Default).
6. **Ports Exposes**: `80` (das ist der Port, auf dem nginx im
   Container lauscht, siehe `EXPOSE 80` im Dockerfile).
7. Keine Runtime-Environment-Variablen noetig: Dies ist eine reine
   statische SPA - alle `VITE_*`-Variablen muessten, falls jemals
   genutzt, zur **Build-Zeit** gesetzt werden (Coolify: "Build-Time
   Variables"), nicht als Runtime-Env. Aktuell ist laut
   `.env.example` nur `VITE_CONTACT_WEBHOOK_URL` vorgesehen - pruefen,
   ob das Kontaktformular das tatsaechlich braucht, und den Wert ggf.
   in Coolify unter Build-Variablen hinterlegen.
8. Deploy anstossen und Build-Log beobachten.

## 2. Domain & SSL

1. In der Application unter **Domains**: `kitech-software.de` (und ggf.
   `www.kitech-software.de`) eintragen.
2. Coolify erstellt automatisch ein Let's-Encrypt-Zertifikat via
   Traefik, sobald die Domain per DNS auf diesen Server zeigt und
   Port 80/443 von aussen erreichbar sind. Kein manueller Zertifikats-
   Schritt noetig.

## 3. DNS-Umstellung (offener Punkt - erfordert Registrar-Zugang)

- **Aktuelle VPS-IP:** `87.106.200.173`
- **Aktueller Zustand:** Der A-Record fuer `kitech-software.de` zeigt
  noch auf `185.158.133.1` (vermutlich Lovable-Hosting), verwaltet
  ueber die Nameserver `ns1.dns-parking.com` / `ns2.dns-parking.com`.
- **Noetige Aenderung:** A-Record (und ggf. `www`-CNAME/A-Record) auf
  `87.106.200.173` umstellen.
- Dies erfordert Zugriff auf den Domain-Registrar/DNS-Verwalter des
  Auftraggebers - **nicht** im Rahmen dieser Aufgabe verfuegbar und
  daher **nicht** durchgefuehrt worden.
- Empfehlung: DNS-Umstellung erst vornehmen, **nachdem** die Coolify-
  Application erfolgreich deployed und ueber die Server-IP direkt
  (z. B. per `curl -H "Host: kitech-software.de" http://87.106.200.173/`
  oder eine temporaere Coolify-Preview-Domain) verifiziert wurde.

## 4. Coolify-Zugang (offener Punkt)

- Das Anlegen des Coolify-Projekts/der Application selbst erfordert
  einen Login im Coolify-Dashboard - diese Zugangsdaten liegen dieser
  Aufgabe nicht vor. Schritte 1-2 oben muessen daher vom Auftraggeber
  (oder mit bereitgestellten Coolify-Zugangsdaten) manuell ausgefuehrt
  werden.

## 5. Lovable-Ausstieg (separater, spaeterer Schritt)

**Wichtig:** Diese Aenderungen wurden in dieser Aufgabe bewusst
**nicht** durchgefuehrt, solange Coolify noch nicht live und
verifiziert ist - Lovable soll bis dahin als Fallback nutzbar bleiben.
Sobald Coolify produktiv laeuft und die DNS-Umstellung bestaetigt ist,
sind folgende Lovable-Reste zu entfernen:

| Datei | Zeile(n) | Was |
|---|---|---|
| `package.json` | 20 | Dependency `"@lovable.dev/mcp-js": "^0.20.0"` |
| `package.json` | 88 | DevDependency `"lovable-tagger": "^1.1.13"` |
| `vite.config.ts` | 4 | `import { componentTagger } from "lovable-tagger";` |
| `vite.config.ts` | 5 | `import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";` |
| `vite.config.ts` | 13 | `plugins: [react(), mode === "development" && componentTagger(), mcpPlugin()].filter(Boolean),` -> zu `plugins: [react()],` vereinfachen |
| `src/lib/mcp/index.ts` | 1 | `import { defineMcp } from "@lovable.dev/mcp-js";` (gesamtes `src/lib/mcp/`-Verzeichnis nutzt das Lovable-MCP-SDK: `index.ts`, `tools/get-case-studies.ts`, `tools/get-contact.ts`, `tools/get-services.ts`, `tools/get-company-info.ts` - pruefen, ob dieses Feature ueberhaupt noch gebraucht wird, oder komplett entfernen) |
| `.lovable/` | (Verzeichnis) | Lovable-Projektmetadaten (`plan.md`, `mcp/`) - kann nach dem Umstieg geloescht werden |
| `public/_redirects` | (Datei) | Lovable/Netlify-spezifische SPA-Fallback-Datei, ersetzt durch `deploy/nginx.conf` - kann entfernt werden, sobald Lovable-Hosting nicht mehr genutzt wird |
| `public/_headers` | (Datei) | Lovable/Netlify-spezifische Security-Header-Datei, ersetzt durch `deploy/nginx.conf` - kann entfernt werden, sobald Lovable-Hosting nicht mehr genutzt wird |

Nach dem Entfernen: `bun install` (bzw. `npm install`) erneut
ausfuehren, damit Lockfiles aktualisiert werden, und den Coolify-Build
erneut verifizieren, bevor gemerged/deployed wird.

## QA-Ergebnis (lokal auf diesem VPS durchgefuehrt)

- `docker build -t kitech-webseite-test -f Dockerfile .` -> erfolgreich.
- Testcontainer (`kitech-webseite-test-run`, Port `8181:80`) gestartet,
  `curl http://localhost:8181/` lieferte HTML mit dem erwarteten
  `<title>KITech Software – KI mit ROI-Garantie</title>`.
- Testcontainer und Test-Image danach wieder entfernt
  (`docker stop`/`docker rm`/`docker rmi`) - keine Test-Artefakte auf
  dem geteilten VPS zurueckgelassen.
