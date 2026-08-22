# Benachrichtigungen einrichten

> Was die Website meldet und wie die Meldung bei Ayham ankommt.
> Der Code dazu: `src/app/api/ereignis/route.ts`, `src/app/api/tagesbericht/route.ts`.

Die Website schickt ihre Meldungen an **eine** Adresse (`EREIGNIS_WEBHOOK_URL`).
Was danach damit passiert — Telegram, E-Mail, CRM — entscheidet n8n. Deshalb
muss beim Wechsel des Kanals nie wieder die Website angefasst werden.

```
Website ──POST──> n8n-Webhook ──> Nachricht bauen ──> Telegram / E-Mail / …
```

## Stand (20.08.2026)

| Teil | Zustand |
|---|---|
| `/api/ereignis`, `/api/tagesbericht` | gebaut, deployt, getestet |
| `TAGESBERICHT_SECRET`, `IPINFO_TOKEN` in Coolify | gesetzt |
| Plausible zählt | ja — `stats.kitech-software.de`, CE v3.2.0 |
| Täglicher Bericht per E-Mail | **läuft** — Cron 8:00, Microsoft Graph, siehe Schritt 6 |
| `PLAUSIBLE_API_KEY` in Coolify | nicht gesetzt — vom Tagesbericht nicht mehr gebraucht, siehe Schritt 5 |
| n8n als Coolify-Service | angelegt und läuft (`n8n-automation`) |
| n8n über **HTTPS** | ⚠️ offen — siehe Schritt 1 |
| n8n-Ersteinrichtung + Workflow | ⚠️ offen — Schritte 2 und 3 |
| `EREIGNIS_WEBHOOK_URL` in Coolify | ⚠️ offen — Schritt 4 |

**Der Tagesbericht braucht n8n nicht.** Er geht auf Ansage (20.08.2026) per
E-Mail raus: ein Cron auf dem Server ruft die Route auf und verschickt den Text
selbst — siehe [`scripts/tagesbericht/`](../scripts/tagesbericht/README.md).
Die Schritte 1 bis 4 betreffen nur die **Sofortmeldungen** (`/api/ereignis`);
solange sie offen sind, meldet die Website einzelne Besuche an niemanden.

## Schritt 1 — n8n auf HTTPS umstellen

n8n läuft, ist aber nur über **http** erreichbar; Traefik hat keinen
TLS-Router angelegt, weil die Adresse beim ersten Start mit `http://` und
Port `:5678` erzeugt wurde. Über die Coolify-API lässt sich das Feld nicht
ändern, im UI schon:

1. Coolify → Projekt **KITech Website** → Service **n8n-automation**
2. Beim Container `n8n` steht unter **Domains**:
   `http://n8n-dlu2p5fg1qsd0e4nrfe7r5gl.87.106.200.173.sslip.io:5678`
3. Ersetzen durch **eine** der beiden Varianten:
   - `https://n8n-dlu2p5fg1qsd0e4nrfe7r5gl.87.106.200.173.sslip.io`
     (funktioniert sofort, sslip.io löst von selbst auf die Server-IP auf)
   - `https://n8n.kitech-software.de` — **setzt einen A-Record voraus:**
     `n8n` → `87.106.200.173`. Die schönere Adresse; ohne DNS-Eintrag bleibt
     die Seite unerreichbar und Let's Encrypt stellt kein Zertifikat aus.
4. **Redeploy** klicken.

⚠️ Solange n8n über http läuft, geht das Anmeldepasswort unverschlüsselt über
die Leitung. Erst danach den Owner-Account anlegen.

## Schritt 2 — Ersteinrichtung

n8n aufrufen, Owner-Konto anlegen (E-Mail + Passwort). Das erste Konto ist
der Administrator; ohne dieses Konto ist die Instanz für jeden offen, der die
Adresse kennt.

## Schritt 3 — Workflow importieren

In n8n: **Workflows → … → Import from File** und
[`n8n-benachrichtigung.json`](./n8n-benachrichtigung.json) aus diesem Ordner
wählen. Der Workflow enthält:

- **Meldung von der Website** — Webhook, Pfad `kitech-website`
- **Nachricht bauen** — macht aus den Feldern eine lesbare Zeile, kennt alle
  Ereignisse und den Tagesbericht
- **Nur wichtige melden?** — trennt reine Besuche von den Momenten, aus denen
  ein Gespräch werden kann. Wer *jeden* Besuch sofort wissen will, verbindet
  den zweiten Ausgang ebenfalls mit dem Versand.
- **Telegram** — deaktiviert, bis ein Zugang hinterlegt ist. Bot bei
  `@BotFather` anlegen, Token als Credential speichern, Chat-ID eintragen,
  Node aktivieren. Statt Telegram passt hier genauso E-Mail oder Slack.

Danach den Workflow **aktivieren** (Schalter oben rechts) und die
**Production-URL** des Webhook-Nodes kopieren. Sie sieht so aus:

```
https://<n8n-adresse>/webhook/kitech-website
```

## Schritt 4 — Adresse in Coolify eintragen

Coolify → Anwendung **KITech Website** → **Environment Variables**:

```
EREIGNIS_WEBHOOK_URL = https://<n8n-adresse>/webhook/kitech-website
```

Optional `EREIGNIS_WEBHOOK_SECRET` (ein beliebiges Geheimnis) — es geht als
Header `x-tracking-secret` mit, damit n8n fremde Aufrufe abweisen kann.

**Restart** genügt, kein Rebuild: die Variable trägt kein `NEXT_PUBLIC_`.

Prüfen:

```bash
curl -i -X POST https://kitech-software.de/api/ereignis \
  -H 'Content-Type: application/json' \
  -d '{"ereignis":"termin_geoeffnet","seite":"/lass-uns-reden"}'
# 204 erwartet — und in n8n muss eine Ausführung erscheinen
```

## Schritt 5 — Plausible-API-Schlüssel (nur noch für die Route)

> **Seit 20.08.2026:** Der Schlüssel **existiert** (Plausible → Settings → API
> Keys, Name „Tagesbericht") und liegt in
> `/home/deploy/KITech/infra/secrets/tagesbericht.env`. Der tägliche Bericht
> nutzt ihn von dort und fragt Plausible direkt ab — er braucht Coolify nicht.
> Die Schritte unten gelten nur, wenn `/api/tagesbericht` selbst antworten soll
> (n8n-Weg). Bis dahin bleibt die Route bewusst auf 404.

`stats.kitech-software.de` → Konto oben rechts → **Settings** → **API Keys** →
*New API Key*. Namen vergeben (z. B. „Tagesbericht"), Schlüssel kopieren und in
Coolify eintragen:

```
PLAUSIBLE_API_KEY = <Schlüssel>
```

Prüfen (das Secret steht in Coolify unter `TAGESBERICHT_SECRET`):

```bash
curl -X POST https://kitech-software.de/api/tagesbericht \
  -H "x-tagesbericht-secret: <TAGESBERICHT_SECRET>"
```

Antwortet mit den Zahlen des Vortags als JSON — und schickt sie zugleich an den
Webhook. Kommt `{"fehler": "Plausible antwortet nicht …"}`, stimmt der
Schlüssel nicht.

## Schritt 6 — Täglicher Bericht (läuft seit 20.08.2026)

Ein Cron auf dem Server, täglich 8:00 Europe/Berlin:

```cron
0 8 * * * /usr/bin/python3 /home/deploy/KITech/projects/KITech-Webseite/scripts/tagesbericht/sende_tagesbericht.py >> …/.tmp/tagesbericht.log 2>&1
```

Das Skript fragt Plausible direkt ab und verschickt den Bericht über Microsoft
Graph aus dem M365-Postfach. Es geht damit **an dieser Route vorbei** — Grund
und Umfang stehen in
[`scripts/tagesbericht/README.md`](../scripts/tagesbericht/README.md).

Bewusst **nicht** über n8n: der Kanal war E-Mail, und n8n ist noch nicht
eingerichtet (Schritte 1–3). Wer später doch über n8n gehen will, braucht dort
nur **Schedule Trigger** + **HTTP Request** auf `POST /api/tagesbericht` mit dem
Header `x-tagesbericht-secret` — dann muss allerdings `PLAUSIBLE_API_KEY` in
Coolify stehen (Schritt 5), und der Cron kann weg.

## Was gemeldet wird

| Ereignis | Wann |
|---|---|
| `besuch` | einmal je Sitzung, **nur mit Einwilligung** (`visitor-enrichment.ts`) |
| `termin_geoeffnet` | jemand öffnet `/lass-uns-reden` |
| `popup_geklickt` | jemand klickt im Startseiten-Popup auf „Ja, Call buchen" |
| `telefon_geklickt`, `email_geklickt` | Direktwege auf der Terminseite |
| `selbstcheck_fertig` | der EU-AI-Act-Check wurde zu Ende gemacht |
| `tagesbericht` | einmal täglich, ausgelöst von außen |

**Ohne Einwilligung** gehen mit: Ereignis, Seite, Referrer, Kampagne. Kein
Cookie, kein localStorage, keine IP.
**Mit Einwilligung** zusätzlich: Firma, Ort, Region, Land — über `ipinfo.io`,
serverseitig abgefragt. Eine Person ist damit nicht bestimmbar; mehr gibt eine
IP bei keinem Anbieter her.

⚠️ Das aktuell gesetzte `IPINFO_TOKEN` stand bis zum 14.08.2026 im
Client-Bundle und war damit öffentlich lesbar. Es funktioniert, sollte aber bei
ipinfo.io **neu erzeugt** und hier ersetzt werden.
