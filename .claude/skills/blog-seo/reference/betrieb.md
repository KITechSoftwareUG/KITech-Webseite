# Die Automatik bedienen

Läufe starten, Entwürfe freigeben, Fehler finden. Der Code liegt unter
`scripts/blog-engine/`, die Artikel unter `content/wissen/`, die Protokolle unter
`content/seo/laeufe/`.

**Stand 19.08.2026: vollständig gebaut und lauffähig.** Ausgeführt wird über die
`npm run blog:*`-Skripte, die `tsx` als Laufzeit nutzen.

---

## Was vorhanden ist

| Teil | Datei | Stand |
|---|---|---|
| Keyword-, SERP- und Backlink-Daten | `lib/dataforseo.ts` | vorhanden |
| Volltexte der rankenden Seiten | `lib/firecrawl.ts` | vorhanden |
| Hausstil- und Substanzprüfung | `lib/qualitaet.ts` (+ `qualitaet.test.ts`) | vorhanden, 39 harte und 42 weiche Regeln |
| Schreibstandard als System-Prompt | `prompts/hausstil.md` | vorhanden |
| Vertrag zwischen den Schritten | `lib/typen.ts` | vorhanden |
| 01 Themenfindung | `schritte/01-themenfindung.ts` | vorhanden |
| Ablaufsteuerung | `lauf.ts` | `npm run blog:lauf` |
| Einzelprüfung eines Artikels | `pruefe.ts` | `npm run blog:pruefen` |
| Vorrat lesen und schreiben, Protokoll | `lib/artikel-io.ts`, `lib/protokoll.ts` | steht |
| IndexNow-Meldung | `lib/indexnow.ts` | `npm run blog:indexnow` |
| 02 bis 09 | `schritte/02-auswahl` bis `schritte/09-ablegen` | steht |
| Themen-Vorrat | `content/seo/themen-pool.json` | steht — wächst mit jedem Eintrag |
| Anleitung zur Einrichtung | `deploy/BLOG-ENGINE.md` | steht |

**In `package.json` gibt es bislang keine Scripts für die Automatik.** Vorhanden sind nur
`dev`, `build`, `start`, `lint`, `test`, `test:watch`. Aufgerufen wird deshalb direkt über
Node — dieselbe Form, die in `SKILL.md` schon steht:

```bash
npm run blog:lauf -- --anzahl 2
npm run blog:pruefen -- <slug> -v
```

Was **heute** schon funktioniert und der wichtigste Befehl überhaupt ist:

```bash
npm test        # Schema, Verlinkung, Routen, Ankertexte — bricht bei jedem Verstoß
npm run build   # bricht zusätzlich bei jedem Schemafehler im Artikelbestand ab
```

---

## Die neun Schritte

Die Reihenfolge steht in `lib/typen.ts` und ist nicht beliebig:

```
01 Themenfindung    Was könnte man schreiben?  (Vorrat + Keyword-Daten)
02 Auswahl          Was schreibt man heute?    (Bewertung, Dublettenschutz)
03 SERP             Was steht schon da?
04 Recherche        Was steht dort tatsächlich drin?  (Volltexte, Lücken)
05 Brief            Was soll drinstehen, das dort nicht steht?
06 Schreiben        Der Artikel
07 Prüfen           Hausstil, Belege, Substanz — hartes Tor
08 Verlinken        Einhängen, und alte Artikel zeigen auf den neuen
09 Veröffentlichen  Ablegen, bauen, ausliefern, melden
```

**03 und 04 sind getrennt, weil sie unterschiedlich teuer sind.** Eine SERP-Abfrage kostet
Bruchteile eines Cents, das Auslesen von zehn Seiten ein Vielfaches. Wer nach 03 abbricht,
weil das Thema von Behörden und Verlagen besetzt ist (`SerpBild.aussichtslos`), hat fast
nichts ausgegeben.

**01 und 02 sind getrennt, weil Auswahl ohne Netzwerkzugriff testbar ist** und Zusammenstellen
mit Netzwerkzugriff nicht.

---

## Die beiden Modi

`LaufProtokoll.modus` kennt genau zwei Werte.

| Modus | Was passiert | Wann |
|---|---|---|
| **`entwurf`** — Standard | Der Artikel entsteht, wird geprüft, landet als `status: "entwurf"` in `content/wissen/` und **erscheint nicht auf der Website**. Ein Mensch sieht ihn an | Immer, solange nicht ausdrücklich anders entschieden |
| **`auto`** | Derselbe Ablauf, aber der Artikel geht mit `status: "veroeffentlicht"` und einem `freigabe`-Objekt live | Nur explizit gesetzt, und erst nach mehreren von Hand durchgesehenen Läufen |

Der Entwurfsmodus ist nicht die vorsichtige Variante, sondern die inhaltlich richtige: Er ist
die Stelle, an der aus „automatisch erzeugt" ein redaktioneller Vorgang wird — genau die
Unterscheidung, die Googles Bewertungsrichtlinien mit *„the extent to which a human being
actively worked to create satisfying content"* beschreiben.

Im Auto-Modus steht als Freigebender, was in `BLOG_ENGINE_FREIGABE_VON` steht. Ohne die
Variable steht dort „Automatik" — ehrlich, aber schlechter.

**Der Lauf deployt nicht von selbst.** Ohne `BLOG_ENGINE_DEPLOY=1` endet er beim Push. Das
Repo deployt bewusst nicht nach jedem Push (siehe `CLAUDE.md`, Abschnitt Hosting); die
Variable ist die einzige Ausnahme davon.

---

## Einen Entwurf freigeben

1. `content/wissen/<slug>.json` lesen. Zuerst `substanz` und `quellen`: Trägt der Eigenanteil?
   Hat jede Zahl im Text einen Beleg mit URL und Abrufdatum?
2. Im JSON setzen:

```json
"status": "veroeffentlicht",
"freigabe": { "von": "Ayham Alkhalil", "am": "2026-08-19" }
```

3. `npm test && npm run build`

Das Schema erzwingt beides zusammen: `status: "veroeffentlicht"` ohne `freigabe` ist ein
Schemafehler und bricht den Build ab. Ein Artikel ohne benannte Freigabe ist ein Entwurf.

Zurückziehen geht genauso: `status: "zurueckgezogen"`. Damit ist er sofort von der Website und
aus der Sitemap, ohne dass eine Datei gelöscht werden muss. Das ist der eingebaute Not-Aus aus
`risiko.md`.

---

## Umgebungsvariablen

Alle stehen in `.env.example` mit ausführlicher Begründung. Keine trägt ein
`NEXT_PUBLIC_`-Präfix — sonst lägen die Zugangsdaten im Client-Bundle.

| Variable | Wofür | Ohne sie |
|---|---|---|
| `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` | Suchvolumen, Schwierigkeit, Intention, SERP | Schritt 01 liefert `daten: null`, die Auswahl fällt auf `prioritaet` zurück |
| `DATAFORSEO_SANDBOX=1` | Kostenlose Dummy-Daten, identische Antwortstruktur | Es wird echt abgerechnet |
| `DATAFORSEO_TAGESLIMIT_USD` | Kostenbremse, Standard **5,00 $** | Standard greift |
| `FIRECRAWL_API_KEY` | Volltexte der rankenden Seiten | Schritt 04 hat keine Recherchebasis |
| `FIRECRAWL_TAGESLIMIT_CREDITS` | Kostenbremse, Standard **300 Credits** | Standard greift |
| `ANTHROPIC_API_KEY` | Schreiben und Prüfen | Kein Artikel entsteht |
| `ANTHROPIC_TAGESLIMIT_TOKEN` | Kostenbremse, Standard **2.000.000** — ein Artikel verbraucht überschlägig 60.000 bis 120.000 über alle Schritte | Standard greift |
| `BLOG_ENGINE_FREIGABE_VON` | Name im `freigabe`-Objekt im Auto-Modus | Dort steht „Automatik" |
| `BLOG_ENGINE_DEPLOY` | Nur mit `1` wird nach dem Commit deployt | Der Lauf endet beim Push |
| `COOLIFY_API_BASE`, `COOLIFY_API_TOKEN`, `COOLIFY_APP_UUID` | Der Deploy selbst | Kein Deploy |
| `BLOG_ENGINE_WEBHOOK_URL`, `…_SECRET` | Meldung nach jedem Lauf | Keine Meldung |
| `INDEXNOW_KEY` | Meldet neue Adressen an Bing, Yandex, Seznam, Naver, Yep, Internet Archive und Amazonbot | Keine Meldung |

⚠️ **Google nimmt an IndexNow nicht teil und war nie dabei.** Der Nutzen liegt bei Bing und
damit bei Microsoft Copilot — der einzigen Engine mit offiziellem Zitations-Reporting. Der
Schlüssel ist 8 bis 128 Zeichen aus `a-z A-Z 0-9 -`; zusätzlich muss `public/<key>.txt` mit
dem Schlüssel als Inhalt existieren.

**Ohne gesetzte Schlüssel läuft die Automatik schlechter, aber nicht kaputt.** Schritt 01
fängt jeden fehlgeschlagenen API-Aufruf ab (`ohneAbbruch`) und meldet ihn als Warnung. Die
Begründung steht im Code: Ohne Suchvolumen wird die Auswahl schlechter und fällt auf die vom
Menschen gepflegte Priorität zurück — ein brauchbares Notprogramm. Ein abgebrochener Lauf
dagegen produziert gar nichts, obwohl der Eigenanteil längst im Vorrat steht.

---

## Die Kostenbremsen

| Dienst | Grenze | Wie sie greift |
|---|---|---|
| DataForSEO | Standard 5,00 $ | Geprüft **vor** jedem Aufruf gegen den bereits verbrauchten Betrag. Die laufende Anfrage darf das Limit überschreiten, die nächste kommt nicht mehr durch |
| Firecrawl | Standard 300 Credits | Geschätzt **vorab**: Scrape 1 Credit je Seite, `json`-Format 4 Aufschlag, Suche 2 je angefangene 10 Ergebnisse. Reicht das Budget nicht, wird gar nicht erst abgerufen |
| Anthropic | Standard 2.000.000 Token | Prozessweit |

**Alle drei Zähler leben im Prozess, nicht im Tag.** Zehnmal starten heißt zehnmal das volle
Limit. Deshalb zusätzlich ein echtes Tageslimit im DataForSEO-Dashboard setzen — die API
quittiert es mit Status `40203`.

Greift eine Bremse, bricht der jeweilige Aufruf mit Klartext ab und nennt die Variable, über
die man sie anhebt. Das ist kein Fehler im Lauf, sondern der vorgesehene Ausgang: Der Lauf
soll lieber ohne Artikel enden als mit einer Rechnung, die niemand erwartet hat.

---

## Die Protokolle

Ein Lauf schreibt ein `LaufProtokoll` nach `content/seo/laeufe/` — Kennung (`2026-08-19-1`),
Start und Ende, Modus, welche Themen dran waren, was entstanden ist (Slug, Titel, Status,
Durchgänge, harte Fehler, Warnungen), was schiefging in Klartext, und die Kosten getrennt nach
DataForSEO in USD, Firecrawl in Credits und Claude-Token ein/aus.

Der Ordner wird beim ersten Lauf angelegt.

Wofür man ihn liest: `durchgaenge` zeigt, wie oft nachgebessert werden musste, bis die
Prüfung durchging. Steigt der Wert über Wochen, stimmt etwas am Brief oder am Hausstil-Prompt
nicht — nicht am einzelnen Artikel.

---

## Was zuerst schiefgeht

Nach Häufigkeit, nicht nach Schwere. Die ersten fünf brechen den Build ab; das ist die gute
Sorte Fehler, weil man sie sieht.

| Meldung / Symptom | Ursache | Behebung |
|---|---|---|
| „Der Ankertext … kommt im Abschnitt N nicht vor" | Der häufigste Fehler überhaupt. Das Modell formuliert den Absatz um und lässt den Anker im JSON stehen | Entweder den Ankertext an die echte Textstelle anpassen oder die Formulierung in den Absatz aufnehmen. Nie die Prüfung weichmachen — siehe `verlinkung.md` |
| „Dateiname und slug stimmen nicht überein" | Datei umbenannt oder Slug geändert, das jeweils andere vergessen | Der Dateiname **ist** die URL. Beides angleichen |
| „Zielkeyword … ist doppelt vergeben" | Zwei veröffentlichte Artikel auf dasselbe Ziel | Einen zurückziehen oder umwidmen — Ablauf in `themen.md`, Abschnitt Kannibalisierung |
| „status 'veroeffentlicht' verlangt ein freigabe-Objekt" | Status von Hand gesetzt, Freigabe vergessen | `freigabe` mit `von` und `am` ergänzen |
| „Autor … steht nicht in content/seo/autoren.json" bzw. dasselbe für Cluster | Tippfehler im Slug, oder Autor/Cluster nie angelegt | Slug prüfen; neue Autoren und Cluster gehören zuerst in ihre JSON-Datei |
| Prüfung meldet `substanz-generisch` | „umfassende Erfahrung", „bewährte Vorgehensweisen", „aus vielen Kundenprojekten" ohne einen Fall | Das ist keine Formulierungsfrage. Entweder es gibt einen belegbaren Eigenanteil, oder das Thema fällt aus — `substanz-gate.md` |
| Prüfung meldet `absatz-zu-lang` | Über 55 Wörter in einem Absatz | Drei Gedanken wurden zusammengeschoben. Trennen, nicht kürzen — `struktur.md`, Abschnitt Absatz-Konflikt |
| Ein Thema hat `suchvolumen: null`, andere im selben Lauf auch | Ein einziges `zielKeyword` über 80 Zeichen oder über 10 Wörter. Google Ads weist dann **den gesamten Task** ab | Zu lange Keywords im Vorrat kürzen. Schritt 01 sortiert sie inzwischen vorher aus und setzt nur für sie `null` |
| DataForSEO-Status `40203` | Tageslimit im Dashboard erreicht — das echte, nicht die Prozessbremse | Warten oder Limit im Dashboard anheben. Zum Weiterarbeiten `DATAFORSEO_SANDBOX=1` |
| DataForSEO-Status `40202` | Rate Limit pro Minute. Google-Ads-Endpunkte erlauben nur 12/min | Wartet der Client selbst ab. Tritt es dauerhaft auf, laufen zwei Läufe parallel |
| „Kreditlimit erreicht" | Firecrawl-Bremse. Meistens eine Schleife, nicht echter Bedarf | Weniger Seiten abrufen. `FIRECRAWL_TAGESLIMIT_CREDITS` erst anheben, wenn klar ist, wofür |
| Ein Thema mit `fruehestens: heute` fällt durch | Zeitzone. Zwischen Mitternacht und zwei Uhr steht in UTC noch der Vortag | Ist in Schritt 01 gelöst (`Europe/Berlin`). Tritt es woanders auf: dieselbe Stelle nachbauen, nie `toISOString()` |
| „module not found" auf einem `lib/`-Pfad | Die Skripte werden über `tsx` ausgeführt, nicht über `node` | `npm run blog:*` benutzen. Direkte `node`-Aufrufe scheitern an den `.js`-Endungen in den Importen |
| Der Build läuft, aber der Artikel erscheint nicht | `status: "entwurf"` — der Normalfall | Freigeben, siehe oben |
