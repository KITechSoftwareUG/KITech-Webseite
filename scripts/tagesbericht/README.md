# Taeglicher Besucherbericht

Jeden Morgen um 8:00 eine E-Mail mit allem, was die Messung ueber den Vortag
hergibt: Besucher, Besuche, Aufrufe, Absprungrate, Verweildauer, **jeder Klick
mit der Seite, auf der er passiert ist**, Einstiegs- und Ausstiegsseiten,
Herkunft, Land, Geraet, Browser, System und der Tagesverlauf nach Stunden.

```
Cron (8:00) ──> sende_tagesbericht.py ──> Plausible Query-API v2
                          └──> Microsoft Graph ──> aalkh@kitech-software.de
```

## Warum nicht ueber `/api/tagesbericht`?

Die Route in der Website gibt es weiterhin, sie liefert dieselben Grundzahlen an
einen Webhook. Aber jede Erweiterung dort kostet Rebuild und Deploy der
Live-Website — und dieser Bericht soll wachsen duerfen, ohne die Seite
anzufassen. Deshalb fragt das Skript Plausible direkt.

Folge: `PLAUSIBLE_API_KEY` muss in Coolify **nicht** gesetzt sein, damit der
Bericht laeuft. Die Route bleibt ohne den Schluessel auf 404 — sie wird erst
gebraucht, wenn die Meldungen ueber n8n laufen sollen
(siehe `deploy/BENACHRICHTIGUNGEN.md`).

## Einrichtung

Zugangsdaten liegen in `/home/deploy/KITech/infra/secrets/tagesbericht.env`
(Modus 600, ausserhalb jedes Repos). Vorlage: `tagesbericht.env.example`.

Gebraucht werden:

| Wert | Woher |
|---|---|
| `PLAUSIBLE_API_KEY` | `stats.kitech-software.de` → Settings → API Keys |
| `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` | App-Registrierung im M365-Tenant, App-Rolle **Mail.Send** mit Admin-Consent |
| `MAIL_VON` | echtes Postfach im Tenant, aus dem Graph sendet |
| `MAIL_AN` | Empfaenger, mehrere per Komma |

Cron (steht im `deploy`-Crontab, `CRON_TZ=Europe/Berlin` gilt dort bereits):

```cron
0 8 * * * /usr/bin/python3 /home/deploy/KITech/projects/KITech-Webseite/scripts/tagesbericht/sende_tagesbericht.py >> …/.tmp/tagesbericht.log 2>&1
```

## Von Hand aufrufen

```bash
# Bericht von gestern anzeigen, nichts verschicken
python3 scripts/tagesbericht/sende_tagesbericht.py --trocken

# Ein bestimmter Tag (praktisch zum Ansehen eines vollen Tages)
python3 scripts/tagesbericht/sende_tagesbericht.py --trocken --tag 2026-08-12

# HTML-Fassung statt Text
python3 scripts/tagesbericht/sende_tagesbericht.py --trocken --html --tag 2026-08-12

# Wirklich verschicken
python3 scripts/tagesbericht/sende_tagesbericht.py
```

## Was der Bericht nicht sagt

**Nur einwilligende Besucher.** Plausible laedt erst nach Zustimmung im
Cookie-Banner, ebenso die Besuchsmeldung. Wer ablehnt oder den Banner
ignoriert, taucht in keiner Zahl auf — die echte Besucherzahl liegt darueber.
Der Satz steht unter jeder Mail.

**Keine einzelnen Personen.** Plausible speichert bewusst keine
Besucherprofile: kein Cookie, keine IP, keine Wiedererkennung ueber Tage. „Wer
war das" ist damit prinzipiell nicht beantwortbar — auch nicht mit mehr
Abfragen. Was ginge: die Firmenerkennung ueber `/api/ereignis` (ipinfo.io,
serverseitig, nur mit Einwilligung). Die Meldungen verfallen aktuell
ungespeichert, weil `EREIGNIS_WEBHOOK_URL` nicht gesetzt ist.

**Kein Ort.** `visit:city` und `visit:region` liefern in dieser Instanz nichts —
Plausible CE braucht dafuer eine MaxMind-Datenbank, die nicht eingebunden ist.
Land funktioniert.

## Wenn keine Mail kommt

| Symptom | Ursache |
|---|---|
| „Azure gibt kein Token (401)" | Client-Secret abgelaufen oder falsch |
| „Graph nimmt die Mail nicht an (403)" | App-Rolle `Mail.Send` fehlt oder ohne Admin-Consent |
| Mail „Bericht fehlgeschlagen" | Plausible antwortet nicht oder der API-Schluessel gilt nicht mehr |
| Einzelne Abschnitte fehlen, unten steht „Nicht abrufbar" | eine Abfrage ist gescheitert — der Rest kommt trotzdem |
| Gar nichts | Cron pruefen, dann `--trocken` von Hand laufen lassen |
