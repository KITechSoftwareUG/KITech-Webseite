# Blog-Automatik einrichten

Was zu tun ist, damit `/gratis-wissen` täglich Artikel bekommt — und was das kostet.

Für die tägliche Bedienung siehe `.claude/skills/blog-seo/reference/betrieb.md`.
Diese Datei ist die einmalige Einrichtung.

---

## Was die Automatik tut und was nicht

```
Vorrat → Keyword-Daten → Auswahl → Ergebnisseite → Recherche → Briefing
       → Schreiben → Prüfen → Einhängen → Entwurf ablegen
                                                    ↓
                                          MENSCH LIEST UND GIBT FREI
                                                    ↓
                                       committen · deployen · melden
```

**Der Lauf endet beim Entwurf.** Kein Commit, kein Deploy, nichts Öffentliches.

Das ist keine fehlende Ausbaustufe, sondern der Kern der Sache. Googles
Bewertungsanleitung definiert „Effort" als *„the extent to which a human being
actively worked to create satisfying content"* und nennt als Gegenbeispiel
ausdrücklich massenhafte Erzeugung *„without any oversight, manual curation
etc."*. Der Freigabeschritt ist diese Aufsicht — nachvollziehbar, mit Namen und
Datum im Artikel hinterlegt.

Dazu kommt: Das Repo deployt bewusst nicht automatisch (siehe `CLAUDE.md`,
Abschnitt Hosting). Ein Deploy liefert alles aus, was gerade in `main` liegt —
nicht nur die Artikel.

Vollständige Risikoeinschätzung mit Quellen:
`.claude/skills/blog-seo/reference/risiko.md`.

---

## 1. Schlüssel besorgen

| Dienst | Wofür | Ohne ihn |
|---|---|---|
| **Anthropic** | schreibt und prüft die Artikel | Es geht gar nichts |
| **DataForSEO** | Suchvolumen, Wettbewerb, Ergebnisseiten, Backlinks | Auswahl läuft nur nach gepflegter Priorität, keine Konkurrenzanalyse |
| **Firecrawl** | liest die rankenden Seiten für die Recherche | Der Artikel entsteht ohne Kenntnis dessen, was schon dasteht |
| **IndexNow** | meldet neue Adressen an Bing und Co. | Bing findet die Artikel ein paar Tage später |

**Anthropic** — Schlüssel unter console.anthropic.com anlegen.

**DataForSEO** — Konto unter dataforseo.com, Mindestaufladung 50 USD. Wichtig:
Im Dashboard unter *API Access* stehen **API-Login und API-Passwort**. Das sind
nicht die Anmeldedaten des Kontos. Zum Entwickeln gibt es eine kostenlose
Sandbox mit Beispieldaten.

**Firecrawl** — Schlüssel unter firecrawl.dev, beginnt mit `fc-`. Ein Schlüssel
liegt bereits in anderen KITech-Projekten; ob er wiederverwendet wird oder ein
eigener für die Website angelegt wird, ist eine Frage der Kostenzuordnung.

**IndexNow** — kein Konto nötig, nur ein selbst gewählter Schlüssel:

```bash
openssl rand -hex 16
```

---

## 2. `.env` anlegen

```bash
cp .env.example .env
```

Dann die Abschnitte **DataForSEO**, **Firecrawl**, **Anthropic**,
**Blog-Automatik** und **IndexNow** füllen. Die `.env` ist in `.gitignore` und
bleibt es.

Die drei Kostenbremsen sind vorbelegt und sollten beim ersten Mal niedriger
stehen:

```
DATAFORSEO_TAGESLIMIT_USD=1.00
FIRECRAWL_TAGESLIMIT_CREDITS=100
ANTHROPIC_TAGESLIMIT_TOKEN=500000
```

⚠️ Diese Zähler leben **im Prozess**, nicht über den Tag. Sie begrenzen einen
Lauf, keinen Kalendertag. Ein echtes Tageslimit gehört zusätzlich in die
Dashboards der Anbieter — DataForSEO quittiert ein überschrittenes Limit mit
Statuscode 40203.

---

## 3. IndexNow-Prüfdatei anlegen

```bash
npm run blog:indexnow -- --keydatei
```

Legt `public/<schlüssel>.txt` an. Die Datei muss mit dem nächsten Deploy live
gehen — der Dienst ruft sie ab, bevor er eine Meldung annimmt. Ohne sie kommt
eine 403 zurück, und zwar erst bei der ersten echten Meldung.

⚠️ **Google nimmt an IndexNow nicht teil und war nie dabei.** Empfänger sind
Bing, Yandex, Seznam, Naver, Yep, das Internet Archive und Amazonbot. Der Nutzen
liegt bei Bing — und damit bei Microsoft Copilot, dem einzigen großen Anbieter
mit offiziellem Zitations-Reporting für KI-Antworten.

---

## 4. Den ersten Lauf machen

**Trocken zuerst.** Kostet nichts und zeigt, was passieren würde:

```bash
npm run blog:lauf -- --trocken
```

Dann ein einzelner echter Artikel:

```bash
npm run blog:lauf -- --anzahl 1
```

Danach liegt ein Entwurf unter `content/wissen/`. Lesen. Wirklich lesen — nicht
überfliegen. Die Frage, auf die es ankommt, beantwortet kein Prüfmodul:

> Steht hier etwas, das nicht auf den ersten zehn Ergebnissen steht?

Wenn ja:

```bash
npm run blog:pruefen -- <slug> -v
npm run blog:freigeben -- <slug> --von "Ayham Alkhalil"
npm test && npm run build
git add content/ && git commit -m "Gratis-Wissen: <Titel>" && git push
```

Deploy wie gewohnt über die Coolify-API. Danach:

```bash
npm run blog:indexnow
```

Wenn nein: Datei löschen. Ein Entwurf, der nicht überzeugt, wird nicht
nachgebessert, bis er durchgeht — er wird gelöscht und das Thema bekommt eine
Notiz im Vorrat.

---

## 5. Den Vorrat füllen

Das ist die eigentliche Arbeit, und sie ist die einzige, die ein Mensch machen
muss.

`content/seo/themen-pool.json` enthält Themen. Ein Thema **ohne** belegten
Eigenanteil (`substanz: null`) wird nie produziert — das Tor ist hart und darf
es bleiben.

Was als Eigenanteil zählt und was nicht, steht ausführlich in
`.claude/skills/blog-seo/reference/substanz-gate.md`. Die Kurzfassung: eine
gemessene Zahl, eine Konfiguration aus einem echten Projekt, eine Entscheidung
mit Begründung, ein Fehler mit Kosten, eine gelesene Primärquelle, ein
zerlegter Ablauf. Nicht: „umfassende Erfahrung", „aus vielen Kundenprojekten",
eine gute Zusammenfassung fremder Texte.

**Ist der Vorrat leer, erscheint nichts.** Das ist der vorgesehene Zustand, kein
Ausfall. Googles Prüfliste für hilfreiche Inhalte nennt als Warnsignal wörtlich,
Inhalte zu veröffentlichen, nur damit die Website frisch wirkt — mit dem
Klammerzusatz *„(No, it won't)"*.

---

## 6. Täglich laufen lassen

Erst nach ein paar Läufen von Hand. Wer den Zeitplan einrichtet, bevor er drei
Entwürfe gelesen hat, automatisiert etwas, das er nicht kennt.

**systemd-Timer** auf dem Server:

```ini
# /etc/systemd/system/kitech-blog.service
[Unit]
Description=KITech Blog-Automatik
After=network-online.target

[Service]
Type=oneshot
User=deploy
WorkingDirectory=/home/deploy/KITech/projects/KITech-Webseite
EnvironmentFile=/home/deploy/KITech/projects/KITech-Webseite/.env
ExecStart=/usr/bin/npm run blog:lauf -- --anzahl 2
```

```ini
# /etc/systemd/system/kitech-blog.timer
[Unit]
Description=KITech Blog-Automatik, werktags morgens

[Timer]
OnCalendar=Mon..Fri 06:30
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl enable --now kitech-blog.timer
systemctl list-timers kitech-blog.timer
```

**Alternativ über n8n** — der Dienst läuft bereits als Coolify-Anwendung. Ein
Zeitplan-Knoten, ein SSH- oder Ausführungs-Knoten, fertig. Der Vorteil: Die
Meldung am Ende geht ohnehin an n8n, dann liegt beides an einer Stelle.

**Die Meldung einrichten:** `BLOG_ENGINE_WEBHOOK_URL` auf denselben n8n-Dienst
zeigen lassen, der schon die Ereignismeldungen bekommt (siehe
`deploy/BENACHRICHTIGUNGEN.md`). Nach jedem Lauf kommt eine Zusammenfassung:
welche Entwürfe entstanden sind, wie viele Befunde offen sind, was der Lauf
gekostet hat.

---

## 7. Was ein Lauf kostet

Nachgerechnet an den gemessenen Prompt-Größen und den Listenpreisen (Stand
August 2026: Opus 5 fünf Dollar je Million Eingabe-Token und 25 je Million
Ausgabe-Token, Sonnet 5 zwei beziehungsweise zehn im Einführungspreis).

| Schritt | Modell | Kosten je Artikel |
|---|---|---|
| 05 Briefing | Sonnet 5 | $0,06 |
| 06 Schreiben | Opus 5 | $0,13 |
| 07 Nachbessern, bis zu zwei Durchgänge | Opus 5 | $0,23 |
| 08 Einhängen, bis zu drei Kandidaten | Sonnet 5 | $0,03 |
| **je Artikel** | | **$0,44** |

Dazu DataForSEO. ⚠️ **Gemessen statt geschätzt (24.08.2026):** Ein Lauf im
Trockenmodus über acht Kandidatenthemen — also nur Schritt 01, ohne
SERP-Analyse, ohne Recherche, ohne Schreiben — kostete **17,8 Cent**
(Kontostand 0,8072 → 0,62876 $). Hier stand vorher „rund 13 Cent je Lauf" für
den *ganzen* Durchgang; das war zu niedrig. Die SERP-Analyse in Schritt 03
kommt je Artikel dazu. Dazu etwa zwölf Firecrawl-Credits aus
dem Monatspaket.

**Ein Lauf mit zwei Artikeln kostet damit rund einen Dollar. Bei zwanzig
Werktagen sind das etwa 20 Dollar im Monat**, plus das Firecrawl-Paket.

⚠️ **Eine frühere Fassung dieser Datei nannte drei bis fünf Dollar je Lauf.**
Das war geschätzt, nicht gerechnet, und um den Faktor drei bis fünf zu hoch.
Jeder Lauf schreibt seine tatsächlichen Kosten ins Protokoll unter
`content/seo/laeufe/` — nach einer Woche steht dort die gemessene Zahl statt
dieser Rechnung.

### Der Weg, der nichts kostet

Wer keine Zugänge einrichten will, überspringt die Automatik und nimmt nur die
Vorarbeit:

```bash
npm run blog:brief                 # welche Themen stehen bereit?
npm run blog:brief -- <thema-id>   # Briefing plus JSON-Gerüst
```

Das erzeugt aus dem Themen-Vorrat, dem Artikelbestand und der Verlinkungslage
ein vollständiges Redaktionsbriefing — mit Eigenanteil, Abgrenzung zu den
Nachbarartikeln, freien Verlinkungszielen samt der schon vergebenen Ankertexte
und den Hausstil-Kennzahlen. Dazu ein JSON-Gerüst mit allen Pflichtfeldern.

Geschrieben wird dann von Hand oder von einem Assistenten, der ohnehin schon
läuft. Danach greifen dieselben Prüfungen wie bei der Automatik:

```bash
npm run blog:pruefen -- <slug> -v
npm run blog:freigeben -- <slug> --von "Ayham Alkhalil"
```

**Kosten: null.** Keine Zugangsdaten, keine Abrechnung.

Was dabei fehlt, ist die Kenntnis der Ergebnisseite — was die zehn Seiten, gegen
die man antritt, tatsächlich schreiben und was sie auslassen. Genau dafür sind
DataForSEO und Firecrawl da. Ohne sie muss die Frage „was steht hier, das dort
nicht steht?" von Hand beantwortet werden. Das Briefing stellt sie deshalb
ausdrücklich, statt sie zu überspringen.

## 8. Was zuerst schiefgeht

| Symptom | Ursache | Was hilft |
|---|---|---|
| „Kein Thema mit belegtem Eigenanteil verfügbar" | Vorrat leer oder alle Themen ohne `substanz` | `themen-pool.json` füllen. Das ist kein Fehler der Automatik. |
| Lauf bricht mit Zugangsdaten-Fehler ab | `.env` nicht geladen | Beim Timer `EnvironmentFile` prüfen. Im Terminal lädt `npm` die `.env` nicht von allein. |
| DataForSEO-Statuscode 40202 | Rate Limit | Wird automatisch wiederholt. Kommt es dauernd, ist der Google-Ads-Engpass erreicht: 12 Anfragen pro Minute. |
| Firecrawl liefert `blockiert: true` | Zielseite weist den Abruf ab | Kein Fehler. Der Credit ist trotzdem verbraucht, die Seite fällt aus der Recherche. |
| Build bricht nach dem Lauf ab | Ein Entwurf verletzt das Schema | Die Fehlermeldung nennt Datei und Feld. Meist eine Längengrenze. |
| „Ankertext steht nicht im Abschnitt" | Der Verweis wurde erfunden statt zitiert | Wird beim Schreiben automatisch entfernt. Steht es im Build, ist eine Datei von Hand geändert worden. |
| IndexNow antwortet mit 403 | Prüfdatei nicht erreichbar | `https://kitech-software.de/<key>.txt` aufrufen. Sie muss deployt sein, nicht nur lokal liegen. |
| Artikel liest sich generisch | Der Eigenanteil war dünn | Nicht nachbessern. Löschen, Thema mit besserer `substanz` versehen. |

---

## 9. Der Not-Aus

Vorher festlegen, nicht im Ernstfall überlegen.

1. **Wöchentlich** in der Search Console unter *Manuelle Maßnahmen* nachsehen.
   Das ist die einzige Stelle, an der eine Sanktion angekündigt wird.
2. **Monatlich** prüfen, wie die Seiten außerhalb des Blogs stehen. Fällt
   `/leistungen` oder die Suche nach dem Firmennamen, ist es kein Blogproblem
   mehr — die Bewertung findet auf Website-Ebene statt.
3. **Einen Artikel zurückziehen:**
   ```bash
   npm run blog:freigeben -- <slug> --zurueckziehen
   npm test && npm run build
   ```
   Er verschwindet aus Übersicht, Themenseite, Sitemap und Feed. Die Datei
   bleibt liegen.
4. **Vierteljährlich aufräumen:** Was nach sechs Monaten keine Impressionen und
   kein Engagement hat, wird zurückgezogen. Ballast sammelt sich sonst an und
   zählt gegen die ganze Website.

⚠️ **Ausdrücklich nicht:** auf eine zweite Domain ausweichen, wenn es klemmt.
Das ist wörtlich ein Beispiel aus Googles Spam-Richtlinie (*„Creating multiple
sites with the intent of hiding the scaled nature of the content"*) und wird
zusätzlich als Umgehung behandelt.

---

## 10. Was noch offen ist

- **Die Wettbewerberliste für den Backlink-Radar** ist leer.
  `content/seo/wettbewerber.json` mit drei bis acht Domains füllen, die
  tatsächlich um dieselben Suchbegriffe konkurrieren. Die Ergebnisseiten aus den
  Lauf-Protokollen sind die beste Quelle dafür.
- **Bing Webmaster Tools** einrichten und die Domain bestätigen. Der
  AI-Performance-Bericht dort ist das einzige offizielle Zitations-Reporting,
  das ein großer Anbieter für KI-Antworten bereitstellt.
- **Ein eigenes Vorschaubild je Artikel** gibt es nicht; alle nutzen das
  Standardbild. Das ist bewusst so: Ein `opengraph-image.tsx` unter `[slug]`
  würde bei jedem Build ein Bild pro Artikel rendern und den Build irgendwann
  von Minuten auf Stunden ziehen. Wenn Bilder kommen, dann eines je Thema.
- **`llms.txt` und `llms-full.txt`** hängen inhaltlich hinterher. Für Google ist
  das folgenlos — die Suchmaschine liest die Dateien nach eigener Aussage nicht.
  Für Coding-Agenten, die sie tatsächlich abrufen, ist eine veraltete
  Selbstbeschreibung aber schlechter als keine. Aktualisieren oder löschen.
