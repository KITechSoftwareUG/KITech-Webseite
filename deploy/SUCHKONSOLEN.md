# Search Console und Bing Webmaster Tools einrichten

✅ **Stand 26.08.2026: beide sind eingerichtet und bestätigt.** Google Search
Console (Property-Typ URL-Präfix) und Bing Webmaster Tools, in beiden ist die
Sitemap eingereicht — Google meldet „Erfolgreich" mit 35 erkannten Seiten.

Die Anleitung unten bleibt für den Fall stehen, dass eine Property neu angelegt
werden muss. Die Kennungen selbst stehen in
[`src/config/suchkonsolen.ts`](../src/config/suchkonsolen.ts).

Die Website liefert alles, was die Dienste brauchen: Sitemap, saubere
Canonicals, gültiges JSON-LD. Was fehlt, ist die Bestätigung, dass die Domain
jemandem gehört.

---

## Warum Meta-Tag und nicht DNS

Die Nameserver liegen bei Hostinger (`ns1.dns-parking.com`). Ein TXT-Eintrag
braucht also Zugang zu deren Oberfläche. Das Meta-Tag braucht nur einen Deploy,
und der Weg steht ohnehin bereit.

Der einzige Nachteil: Der Property-Typ **Domain** (mit allen Subdomains) geht
nur über DNS. Für die Zwecke hier genügt **URL-Präfix** auf
`https://kitech-software.de` — die Subdomains `funnel.` und `fokus.` stehen
ohnehin auf `noindex`.

---

## Schritt 1 — Google Search Console

1. https://search.google.com/search-console öffnen, mit dem Google-Konto anmelden.
2. **Property hinzufügen** → Typ **URL-Präfix** → `https://kitech-software.de`
3. Bestätigungsmethode **HTML-Tag** wählen. Google zeigt so etwas:

   ```html
   <meta name="google-site-verification" content="AbC123..." />
   ```

4. **Nur den Wert von `content`** in
   [`src/config/suchkonsolen.ts`](../src/config/suchkonsolen.ts) eintragen:

   ```ts
   export const GOOGLE_SITE_VERIFICATION: string | null = "AbC123...";
   ```

5. Deployen. Danach in der Search Console auf **Bestätigen** klicken.

6. Nach der Bestätigung unter **Sitemaps** eintragen:
   ```
   https://kitech-software.de/sitemap.xml
   ```

---

## Schritt 2 — Bing Webmaster Tools

Der kurze Weg: https://www.bing.com/webmasters → **Import from Google Search
Console**. Das übernimmt Property und Bestätigung in einem Schritt, ein
zweites Meta-Tag entfällt.

Wer den eigenen Weg geht: Meta-Tag-Bestätigung wählen und den Wert aus
`<meta name="msvalidate.01" content="…">` als `BING_SITE_VERIFICATION`
eintragen.

Bing ist mehr als eine Nebensache: Es speist **Microsoft Copilot**. Und
IndexNow — schon eingerichtet und in Betrieb — meldet dorthin, nicht an Google.

---

## Schritt 3 — was danach zu sehen ist

Nicht sofort. Search Console braucht **zwei bis drei Tage** für die ersten
Daten und etwa **16 Monate** für den vollen Verlauf.

Worauf zu achten ist, sobald Zahlen da sind:

| Wo | Was es beantwortet |
|---|---|
| Leistung → Suchanfragen | Für welche Begriffe die Website erscheint, und auf welcher Position |
| Indexierung → Seiten | Welche der 35 Sitemap-Adressen tatsächlich im Index sind |
| Indexierung → Gründe | Warum eine Seite *nicht* drin ist — der nützlichste Bericht überhaupt |
| Sitemaps | Ob die Sitemap gelesen wurde und wann zuletzt |

⚠️ **Die ersten Wochen sind kein Maßstab.** Eine neue Property zeigt anfangs
wenig, und die beiden Artikel vom 24.08.2026 sind Tage alt. Rankings für
Themen mit Wettbewerb entstehen über Monate, nicht über Tage.

---

## Wozu die Zahlen taugen

Erst mit Search-Console-Daten lässt sich die Blog-Automatik steuern, statt zu
raten: Welche Artikel bekommen Anfragen, aber keine Klicks — dort stimmt der
Titel nicht. Welche stehen auf Position 11 bis 20 — dort lohnt Nacharbeit mehr
als ein neuer Artikel.

Von Hand steht das in der Oberfläche. Für alles andere gibt es den Zugang über
die API, beschrieben im nächsten Abschnitt.

---

# Zugang für die API

Eingerichtet am 01.09.2026. Bedient wird er über `npm run gsc`:

```bash
npm run gsc                              # alle Befehle
npm run gsc -- properties                # Selbsttest: Was ist zugänglich?
npm run gsc -- leistung --tage 28        # Klicks, Impressionen, Position
npm run gsc -- leistung --nach page --pfad /gratis-wissen/
npm run gsc -- seite https://kitech-software.de/gratis-wissen/<slug>
npm run gsc -- sitemaps
npm run gsc -- abdeckung                 # jede Sitemap-Adresse einzeln nachschlagen
```

**Eingereicht sind zwei Sitemaps** (Stand 01.09.2026): `sitemap.xml` und
`gratis-wissen/rss.xml`. Der Feed kam am 01.09.2026 dazu — er stand in der
`robots.txt`, war der Search Console aber nie gemeldet. Google akzeptiert
RSS als Sitemap-Format und ruft Feeds häufiger ab als eine XML-Sitemap; für
frische Artikel ist das der schnellere Kanal.

⚠️ Der Feed liegt unter `/gratis-wissen/rss.xml`, **nicht** unter `/rss.xml` —
der Wurzelpfad ist 404.

Jeder Befehl kennt `--json` und gibt dann Rohdaten aus — dafür ist er gebaut:
damit ein Skript, ein Cron oder eine Agentensitzung die Zahlen weiterverarbeiten
kann, ohne dass jemand in einer Oberfläche klickt.

**Warum das mehr ist als Bequemlichkeit.** DataForSEO kostet Geld und schätzt
den Markt; das Guthaben steht bei 0,45 $. Die Search Console kostet nichts und
**misst die eigenen Seiten**. Für „rankt der Artikel von letzter Woche?" ist sie
nicht die günstigere Quelle, sondern die einzige richtige.

## Warum ein Dienstkonto und nicht der eigene Login

Der OAuth-Weg für Desktop-Anwendungen verlangt einen Browser-Login und liefert
ein Refresh-Token, das Google bei Anwendungen im Status „Test" **nach sieben
Tagen** verfallen lässt. Eine Automatik, die wöchentlich einen Menschen zum
Neuanmelden braucht, ist keine.

Ein Dienstkonto ist ein eigener Nutzer mit eigenem Schlüssel, ohne Ablauf und
ohne Menschen im Weg. Es hängt **nicht** am Google-Konto von Ayham: Es wird der
Property als zusätzlicher Nutzer hinzugefügt, wie ein Mitarbeiter.

## Einrichtung — sechs Schritte

Die ersten vier laufen in der Google Cloud Console, mit demselben Google-Konto,
dem die Search-Console-Property gehört.

**1. Projekt.** https://console.cloud.google.com → oben im Projektwähler
**Neues Projekt** → Name etwa `kitech-website`. Ein bestehendes Projekt tut es
auch; das Projekt kostet nichts und dient nur als Behälter.

**2. API aktivieren.** *APIs und Dienste → Bibliothek* → nach **Google Search
Console API** suchen → **Aktivieren**.
⚠️ Nicht zu verwechseln mit der *Web Search Indexing API* — die ist auf
`JobPosting` und `BroadcastEvent` beschränkt und hier nutzlos.

**3. Dienstkonto anlegen.** *IAM und Verwaltung → Dienstkonten →
Dienstkonto erstellen* → Name etwa `search-console`.
Bei „Diesem Dienstkonto Zugriff auf das Projekt erteilen" **keine Rolle**
auswählen und auf *Weiter* klicken. Die Berechtigung, um die es geht, wird nicht
hier vergeben, sondern in Schritt 6 in der Search Console.

**4. Schlüssel herunterladen.** Das angelegte Dienstkonto öffnen → Reiter
**Schlüssel** → *Schlüssel hinzufügen → Neuen Schlüssel erstellen* → **JSON** →
*Erstellen*. Der Browser lädt eine Datei herunter. **Es gibt keine zweite
Gelegenheit** — Google speichert den privaten Teil nicht.

⚠️ Die Datei enthält `"type": "service_account"`, `client_email` und
`private_key`. Wer stattdessen unter *Anmeldedaten* eine OAuth-Client-Datei
herunterlädt, hat das falsche JSON: Es liegt direkt daneben, sieht genauso aus
und funktioniert nicht. `npm run gsc` sagt es in dem Fall ausdrücklich.

**5. Schlüssel auf den Server.** Nicht ins Repo — die Datei ist ein echtes
Geheimnis, anders als die Bestätigungskennungen in `src/config/suchkonsolen.ts`:

```bash
mv ~/Downloads/<name>.json /home/deploy/KITech/infra/secrets/google-search-console.json
chmod 600 /home/deploy/KITech/infra/secrets/google-search-console.json
```

Dann in `.env` eintragen (der Pfad muss absolut sein — der Cron startet in einem
anderen Verzeichnis):

```
GOOGLE_SERVICE_ACCOUNT_JSON=/home/deploy/KITech/infra/secrets/google-search-console.json
```

**6. Dienstkonto in der Search Console eintragen.** ⚠️ **Der Schritt, den man
vergisst** — und ohne den alles andere umsonst ist. Die Adresse zeigt:

```bash
npm run gsc -- konto
```

Sie sieht aus wie `search-console@kitech-website.iam.gserviceaccount.com`. Damit:

https://search.google.com/search-console → *Einstellungen → Nutzer und
Berechtigungen → Nutzer hinzufügen* → Adresse einfügen → Berechtigung
**Vollständig**.

„Eingeschränkt" genügt nicht: Die URL-Prüfung verlangt vollen Zugriff, und ohne
ihn lässt sich auch keine Sitemap einreichen.

**Probe:**

```bash
npm run gsc -- properties
```

Erwartet wird `https://kitech-software.de/ (siteFullUser)`.

## Wenn es nicht geht

| Meldung | Was wirklich fehlt |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON fehlt` | Schritt 5 — Eintrag in `.env` |
| Leere Property-Liste | Schritt 6 — der Schlüssel ist in Ordnung, das Dienstkonto steht nur nirgends als Nutzer |
| HTTP 403 | Schritt 6, oder die Property-Kennung stimmt nicht zeichengenau |
| HTTP 401 | Der Schlüssel wurde gelöscht — oder die Systemuhr geht falsch (`timedatectl`) |
| `invalid_grant` | Fast immer die Uhr, fast nie der Schlüssel |

⚠️ **Die Property-Kennung ist zeichengenau `https://kitech-software.de/`** — mit
Schrägstrich am Ende. Ohne ihn antwortet Google mit 403 „User does not have
sufficient permission for site" und meint damit nicht die Berechtigung, sondern
dass es diese Property nicht gibt. Die Meldung schickt jeden zuerst in die
Rechteverwaltung. `searchconsole.test.ts` hält den Schrägstrich fest.

## Grenzen, die man kennen muss

- **Die Daten hinken zwei bis drei Tage hinterher.** `--frisch` zeigt auch die
  unvollständigen Tage — brauchbar für „läuft überhaupt etwas", unbrauchbar für
  jeden Vergleich, weil die Zahlen nachträglich steigen.
- **Die Summe der Suchanfragen ist kleiner als die Wahrheit.** Google lässt
  seltene Anfragen weg, um Personen zu schützen. `leistung` stellt deshalb immer
  die Gesamtsumme daneben und benennt die Lücke.
- **16 Monate Historie.** Ältere Zeiträume liefern keinen Fehler, sondern nichts.
- **URL-Prüfung: 2000 Adressen je Tag.** Ein Werkzeug für Einzelfälle, keine
  Schleife über alle Artikel.
- ⚠️ **Die Sitemap-API sagt nicht, was indexiert ist.** Ihr Feld `indexed` ist
  tot: Google liefert konstant `0`. Am 01.09.2026 nachgemessen — „0 von 38
  indexiert", während dieselbe Property 86 Impressionen hatte und die
  URL-Prüfung für die Startseite „Gesendet und indexiert" zurückgab. `gsc`
  zeigt die Zahl deshalb nicht mehr an; sie hätte nur Fehlalarm ausgelöst.
- **Es gibt keinen Befehl, der eine Indexierung erzwingt.** Die Indexing API ist
  auf `JobPosting` und `BroadcastEvent` beschränkt; jede andere Nutzung ist ein
  Verstoß gegen Googles Bedingungen. Was hier schreibt, ist einzig
  `sitemaps --einreichen`.

## Wo der Code liegt

| Was | Wo |
|---|---|
| Tokentausch (JWT, RFC 7523, ohne Fremdpaket) | `scripts/blog-engine/lib/google-auth.ts` |
| API-Aufrufe und ihre Fallstricke | `scripts/blog-engine/lib/searchconsole.ts` |
| Bedienung | `scripts/suchkonsole.ts` |

---

# Zugang für die Bing-API

Seit dem 01.09.2026 gibt es neben `npm run gsc` ein zweites Werkzeug:
`npm run bing`. Es beantwortet die Fragen, die Google nicht beantwortet.

**Warum überhaupt, bei dem Marktanteil.** Zwei Gründe, die damit nichts zu tun
haben. Bings Index speist **Copilot und ChatGPTs Websuche** — wer dort fehlt,
fehlt in Antworten, die nie als Suchtreffer sichtbar werden. Und `GetKeyword`
liefert **echtes Suchvolumen kostenlos**, während DataForSEO je Abfrage
bezahlt wird und das Guthaben bei 0,45 $ steht.

## Einrichtung — zwei Schritte

1. <https://www.bing.com/webmasters> → **Einstellungen → API-Zugriff →
   API-Schlüssel**. Der Schlüssel hängt am angemeldeten Konto, nicht an der
   Site: einer deckt alles ab, was dieses Konto bestätigt hat.
2. In `.env` eintragen als `BING_WEBMASTER_API_KEY`. Prüfen mit
   `npm run bing -- zugang`.

⚠️ **Der Schlüssel ist ein echtes Geheimnis** — anders als
`BING_SITE_VERIFICATION` in `src/config/suchkonsolen.ts`, das ohnehin im HTML
jeder Seite steht. Mit ihm lassen sich 10.000 Adressen am Tag einreichen und
**Sitemaps entfernen**. Er gehört nach `.env`, nie ins Repo.

## Vier Fallstricke, die alle wie ein kaputter Schlüssel aussehen

Keiner davon meldet sich als 403. Alle vier kommen als **HTTP 400** oder als
HTML-Seite — man sucht deshalb zuerst am falschen Ende.

| Symptom | Ursache |
|---|---|
| `Specified argument was out of the range of valid values. Parameter name: country` | `country` muss **klein** sein: `de`, nicht `DE`. |
| `String was not recognized as a valid DateTime` | Datum als `JJJJ-MM-TT`. Das aus Microsofts Doku bekannte `/Date(1754006400000)/` wird im Query-String **nicht** erkannt — gelesen wird es dagegen genau so. |
| HTML statt JSON bei `SubmitUrl`, `SubmitFeed` | **Lesen ist GET, Schreiben ist POST** mit JSON-Rumpf. Die Erfolgsantwort ist `{"d":null}` — keine Bestätigung je Adresse. |
| HTML statt JSON bei `GetGeoRegionSettings`, `GetSiteMoves`, `GetPagePreviewBlocks` | Diese Endpunkte gibt es in der JSON-Schnittstelle wirklich nicht, obwohl sie in der .NET-Bibliothek stehen. |

⚠️ **Bing hat drei Schreibweisen für „nie", und keine ist `null`.**
`GetUrlInfo` antwortet für eine nie geholte Adresse mit
`/Date(-62135568000000)/` (.NET `DateTime.MinValue`, Jahr 1), `GetFeeds` für
eine selbst gefundene Sitemap mit `/Date(-11644473600000)/` (Jahr 1601). Wer
nur prüft, ob das Feld gefüllt ist, **zählt jede unbekannte Seite als geholt**.
Genau das passierte am 01.09.2026 mit `/autoren`; aufgefallen ist es nur, weil
in der Tabelle ein Strich statt eines Datums stand. Die Prüfung gehört deshalb
in `geholtAm()`, nicht an die Aufrufstelle — und steht unter Test.

## Was das Werkzeug kann

```bash
npm run bing -- zugang       # Selbsttest, zeigt auch das Meta-Tag zum Abgleich
npm run bing -- status       # Index gegen Sitemap, Crawl, Feeds, Kontingent
npm run bing -- leistung     # Klicks, Impressionen, Suchanfragen, Seiten
npm run bing -- crawl        # Crawl-Reihe, HTTP-Codes, Beanstandungen
npm run bing -- abdeckung    # jede Sitemap-Adresse einzeln nachschlagen
npm run bing -- seite <url>  # was Bing über eine Adresse weiß
npm run bing -- keyword "…"  # Suchvolumen — kostenlos
npm run bing -- sitemaps     # Stand, --einreichen <adresse>
npm run bing -- einreichen   # zeigt nur; erst --los reicht wirklich ein
```

Jeder Befehl kennt `--json`.

## Die eine Zahl, die zählt

`status` stellt **`InIndex` gegen die Zahl der Sitemap-Adressen**. Diese
Gegenüberstellung gibt es in der Oberfläche nicht, und sie ist die einzige, die
den Zustand beschreibt: Alles andere kann grün sein, während Bing die Hälfte der
Seiten wegwirft.

Stand 01.09.2026: **13 von 38 im Index**, davon **8 überhaupt je geholt** — und
zwar ausschließlich die oberste Navigationsebene. Kein Artikel, kein
Glossareintrag, keine Autorenseite. Die Sitemap wird gelesen (`Success`, 38
Adressen), aber Bing folgt ihr nicht in die Tiefe.

## Warum die Crawl-Rate nicht das Mittel ist

`GetCrawlSettings` erlaubt 24 Stundenwerte auf einer Skala von 1 bis 10; hier
steht überall 5. Das **bleibt so**, und zwar aus einem messbaren Grund: Bing
crawlt an manchen Tagen 27 von 38 Seiten, ohne einen einzigen Timeout, ohne 5xx
und ohne robots.txt-Blockade. Der Crawler wird von nichts ausgebremst.

Eine höhere Rate erlaubt Bing, häufiger anzuklopfen — sie bewirkt nicht, dass
mehr Seiten im Index bleiben. Wer sie hochdreht, ohne einen Engpass gefunden zu
haben, ändert eine Zahl und keinen Zustand.

⚠️ Der tatsächliche Engpass steht direkt daneben: **0 verweisende Seiten**
(`GetLinkCounts`), und `AnchorCount: 0` auf jeder Unterseite. Bing gewichtet
Verlinkung stark. Solange auf eine Seite nichts zeigt, holt Bing sie und behält
sie nicht — `InIndex` sank in vier Tagen von 15 auf 13.

## Einreichen — was es ist und was nicht

Bing nimmt **10.000 Adressen am Tag** entgegen. Das ist der eine Unterschied zu
Google, wo die Indexing API auf `JobPosting` und `BroadcastEvent` beschränkt
ist und es schlicht keinen Weg gibt.

⚠️ **Es ist kein Indexierungsbefehl.** Bing stellt die Adresse in eine
Warteschlange. Dieselbe Adresse mehrfach am Tag einzureichen beschleunigt
nichts und verbraucht Kontingent.

Und es ersetzt nicht IndexNow: `npm run blog:indexnow` meldet jeden **neuen**
Artikel, und das ist Bings bevorzugter Weg. `einreichen` ist der Nachschub für
das, was IndexNow nie gesehen hat — die Seiten von vor seiner Einführung. Am
01.09.2026 waren das 29 Adressen, einmalig eingereicht.

Ohne `--los` passiert nichts; der Befehl zeigt nur, was er täte. Einreichen ist
eine Handlung nach außen, und die soll man ausdrücklich auslösen.

## Wo der Code liegt

| Was | Wo |
|---|---|
| API-Aufrufe, Datumsfallen, GET/POST | `scripts/blog-engine/lib/bing.ts` |
| Bedienung | `scripts/bing.ts` |
| Tests (Schwerpunkt Datumsformat) | `scripts/blog-engine/lib/__tests__/bing.test.ts` |
