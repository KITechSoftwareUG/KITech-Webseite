# CLAUDE.md – KITech Software Website

Corporate-Website von **KITech Software UG (haftungsbeschränkt)**, Hannover —
KI-Beratung und Softwareentwicklung für den Mittelstand.
Live: [kitech-software.de](https://kitech-software.de) · Sprache: de_DE ·
Geschäftsführer: Ayham Alkhalil.

> **Diese Datei beschreibt den Zustand und die Regeln — nicht die Geschichte.**
> Warum etwas so ist, steht in der Commit-Nachricht der Änderung
> (`git log -S "<Suchbegriff>"`) und in den Kopfkommentaren der jeweiligen Datei.
> Wer hier etwas ergänzt, fragt sich: Verhindert das künftig einen Fehler? Wenn
> nein, gehört es ins Commit.

---

## Commands

```bash
npm run dev            # Dev-Server, Port 8080
npm run build          # Production Build
npm run lint           # ESLint
npm test               # Vitest

npm run llms           # llms.txt + llms-full.txt neu erzeugen (nach JEDER Inhaltsänderung)
npm run og             # Standard-Vorschaubild rendern (braucht Chrome)
npm run pruefe:jsonld  # JSON-LD des ausgelieferten HTML prüfen (Live oder URL als Argument)
bash scripts/pruefe-container.sh   # Vollprüfung im Container — vor jedem Deploy

npm run blog:brief -- <thema-id>   # Redaktionsbriefing, kostenlos
npm run blog:lauf -- --trocken     # Automatik-Probelauf, kostet nichts
npm run blog:lauf -- --auto        # durchlaufen bis zur ausgelieferten Seite
npm run blog:pruefen -- <slug> -v  # Hausstil, 81 Regeln
npm run blog:freigeben -- <slug> --von "Name"
npm run blog:indexnow              # nach dem Deploy
```

Vitest läuft über Vite (`vitest.config.ts`), unabhängig vom Next-Build — das ist
Absicht: die Tests lesen einzelne Alt-Seiten per `?raw`-Import.

---

## Was von selbst läuft

| Wann | Was | Wo abschalten |
|---|---|---|
| werktags **6:30** | Blog-Automatik schreibt, prüft, gibt frei, committet, deployt, meldet an IndexNow | `BLOG_ENGINE_FREIGABE_VON` in `.env` leeren |
| täglich **8:00** | Besucherbericht des Vortags per Microsoft Graph | crontab-Zeile |
| bei jedem Besuch | n8n meldet Firmen und Kontaktsignale per Mail | `EREIGNIS_WEBHOOK_URL` in Coolify |

Alle drei in der crontab des Benutzers `deploy` bzw. in n8n — **nichts davon
hängt an einem Deploy.** ⚠️ Zeitangaben gelten nur, weil `CRON_TZ=Europe/Berlin`
in der crontab **vor** den Zeilen steht; sonst liefe alles nach UTC.

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5.8 (strict **aus**) ·
Tailwind 3.4 · shadcn/ui (Radix) · Framer Motion · Lucide · Onest (@fontsource) ·
React Query · React Hook Form + Zod · Sonner · Plausible (self-hosted) · npm.

Path Alias `@/` → `src/`.

---

## Struktur

```
content/            Redaktionelle Inhalte als JSON (von der Blog-Automatik beschrieben)
  wissen/<slug>.json  ein Artikel je Datei, Dateiname = URL
  seo/                autoren.json, cluster.json, themen-pool.json, laeufe/
public/images/      ALLE inhaltlichen Bilder (team/, referenzen/, og/) — siehe images/README.md
scripts/
  blog-engine/      Die Blog-Automatik (lauf.ts, schritte/, lib/, prompts/)
  llms-txt.ts       erzeugt llms.txt + llms-full.txt
  pruefe-jsonld.mjs prüft das ausgelieferte HTML
  pruefe-container.sh  Vollprüfung im Container, vor jedem Deploy
  tagesbericht/     Python, Cron, Microsoft Graph
src/
  app/              Routing (dünne Server-Wrapper, exportieren nur metadata)
  views/            Seiten-Komponenten (NICHT src/pages/ — das wäre Pages Router)
    legacy/         Alt-Seiten, nicht geroutet, aus tsconfig/eslint ausgenommen
  components/
    layout/         PageShell (Rahmen aller Seiten), SiteHeader/Footer, CheckShell,
                    FunnelShell, SignalBackdrop, site-container.ts
    sections/ conversion/ seo/ canvas/ ui/
  config/           navigation.ts (EINZIGE Quelle für Nav + Routen), company.ts,
                    angebot.ts, announcement.ts, suchkonsolen.ts
  data/             Inhalte getrennt von der Darstellung
  lib/              metadata.ts, consent.ts, plausible.ts, wissen/, __tests__/
  proxy.ts          Host-Rewrite: funnel./fokus./app. → interne Pfade
deploy/             COOLIFY.md, BLOG-ENGINE.md, BENACHRICHTIGUNGEN.md, SUCHKONSOLEN.md,
                    n8n-benachrichtigung.json, blog-automatik.cron
Dockerfile          Multi-Stage, node:22-alpine, standalone, Port 3000 — der aktive Build Pack
```

---

## Routen

| Route | Index | Anmerkung |
|---|---|---|
| `/` | ja | Hero (**eine** Aussage + CTA), Kundenkarten, Gründerwort + Team, FAQ, CTA |
| `/warum` + zwei Sales Letter | Weiche ja, Letter **nein** | Letter sind Platzhaltertext (`isPlaceholder`) |
| `/leistungen`, `/solo`, `/enterprise` | ja | Eine Vorlage, zwei Zielgruppen (`data/segments.ts`) |
| `/referenzen`, `/referenzen/[slug]` | Übersicht ja, Details **nein** | Details `noindex`, solange `openPoints` offen sind |
| `/gratis-wissen` + `[slug]`, `/thema/[cluster]`, `/rss.xml` | ja | Content-Bereich, Server Components |
| `/autoren`, `/autoren/[slug]` | ja | `ProfilePage`, Inhalt `content/seo/autoren.json` |
| `/haltung`, `/kontakt`, `/glossar` + `[slug]` | ja | |
| `/karriere` + `[slug]` | **nein** | Platzhalterstellen — siehe Regel unten |
| `/lass-uns-reden` (Alias `/termin`) | ja | Calendly-Embed, consent-gated. Ziel **aller** Termin-CTAs |
| `/selbstcheck_eu_ai_act` (Alias `/selbstcheck`) | **nein** | Markenfrei, siehe Sonderseiten |
| `/funnel`, `/fokus` | **nein** | Kampagnendomains, siehe Sonderseiten |
| `/impressum`, `/datenschutz`, `/agb` | ja | |
| `/app/*` | nein | Eingeloggter Bereich (LogTo), noch nicht freigeschaltet |
| alles andere | – | Echte 404 mit voller Navigation |

**Navigation:** `src/config/navigation.ts` speist Kopfzeile, Fußzeile, Sitemap
und den Routen-Test. Wer eine Seite anlegt, trägt sie dort in eine Navigation
**und** in `siteRoutes` ein — sonst schlägt `npm test` fehl.

`routes.test.ts` liest die echten Routen aus `src/app/**/page.tsx` und prüft:
jeder interne Link zeigt auf eine Route, jede öffentliche Route ist erreichbar,
`siteRoutes` stimmt mit der Wirklichkeit überein, Platzhalter stehen auf
`noindex`. Ausgenommen: `legacy/`, `/funnel`, `/fokus`, der Selbstcheck.

---

## Regeln beim Bauen

**Eine neue Seite:** Inhalt nach `src/data/` → View nach `src/views/` (PageShell
+ `SITE_CONTAINER` + `PageHeading` + `CtaBanner`) → dünner Wrapper
`src/app/<pfad>/page.tsx` mit `buildMetadata()` → in `navigation.ts` eintragen →
`npm test`.

**Was nicht gebaut wird** (Vorgabe Ayham): das Muster *kleines Rechteck-Label →
Überschrift → Erklärabsatz*, und Raster aus gleich großen Karten mit Icon im
abgerundeten Quadrat. Beides liest sich als Baukasten. Stattdessen: Aussage als
Überschrift, höchstens ein Satz darunter, Listen mit Trennlinien (`divide-y`)
statt Kacheln.

**Eckig statt rund.** Neue Komponenten verwenden keine `rounded-*`-Klassen. Nur
`CookieConsent` und die shadcn-Bausteine tun das noch.

**Texte von Ayham sind wörtlich.** Rollen, Bios, Hero-Aussage, Zitate — nicht
umformulieren, auch nicht „glätten".

**CTA-Konvention:** Jeder Termin-Knopf navigiert intern zu `/lass-uns-reden`,
nie per `window.open()` zu Calendly. Die einzige externe Calendly-URL ist die
`data-url` im Embed selbst.

**Naming:** Dateien kebab-case, Komponenten PascalCase, TS-Variablen camelCase,
Konstanten UPPER_SNAKE.

---

## Design-System

**Dark-first.** `:root` und `.dark` sind beide near-black; ein klassisches
Light-Mode gibt es nicht mehr. Tokens (HSL) in `src/index.css`:
`--background` 0 0% 6% · `--foreground` 0 0% 97% · `--primary` 245 85% 62% ·
`--accent` 85 70% 55% (Signal-Lime) · `--border` 0 0% 18%.
Dazu `--solo-accent` (Amber) und `--enterprise-accent` (Lime).

**Schrift:** Onest als Body (`font-thin` als Default), „Recursive Variable" für
Headlines (`kinetic-display`) und Zahlen (`kinetic-data`).

**Container:** `SITE_CONTAINER` (1180 px) für alles, `TEXT_CONTAINER` (760 px)
für Fließtext (Rechtstexte, Glossar). Die Tailwind-`container`-Klasse (1280 px)
stammt aus dem Alt-Layout und wird nicht mehr verwendet.

**Hintergrund:** `SignalBackdrop` über `PageShell` steuern
(`backdrop="header" | "full" | "none"`, `backdropClassName` für eigene Höhe).

### Vier Regeln, die schon einmal Geld gekostet haben

| Regel | Warum |
|---|---|
| **Knöpfe: `min-h-[…] py-…`, nie `h-[…]`** | Die Beschriftung kommt aus `config/angebot.ts` und ändert sich mit dem Angebot. Bei fester Höhe läuft längerer Text oben und unten heraus. Bei **360 px** nachsehen. |
| **Zeilen aus Text + mehreren Knöpfen bei 768 px messen** | Dort ist es am engsten: `md` hat gegriffen, der Platz noch nicht. Und `flex-1` braucht `min-w-0`, sonst drückt der Text die Knöpfe aus dem Bild statt selbst nachzugeben. |
| **`.kinetic-morph-in` animiert nur `transform`** | Mit `opacity: 0` zählt Chrome das Element nicht als gezeichnet — die H1 ist auf jeder Seite der LCP-Kandidat. Kostete einmal 820 ms auf der Startseite. |
| **`kinetic-morph-in` nur auf der H1** | Sonst zappelt beim Laden die ganze Seite. |

---

## SEO und Sichtbarkeit

**Metadaten:** `buildMetadata()` in `src/lib/metadata.ts` — Title, Description,
OpenGraph, Twitter, Canonical, optional `noindex`. Grenzen: **Titel 60**,
**Beschreibung 155** Zeichen, geprüft von `metadaten.test.ts` (auch für Titel,
die zur Laufzeit aus JSON entstehen). Artikel können über `metaTitel` einen
kürzeren Suchtitel als ihre H1 tragen.

**Sitemap** (`src/app/sitemap.ts`) pflegt keine eigene Liste: statische Routen
aus `siteRoutes`, Details aus den Datendateien. Ausgeschlossen werden
`indexable: false` und Alias-Routen. Kein `priority`, kein `changefreq` —
Google ignoriert beide ausdrücklich.

**JSON-LD:** Schema-Funktionen in `components/seo/StructuredData.tsx`,
Zod-Validierung in `lib/schema-validators.ts`.

- ⚠️ Der **Organisations-Knoten** steht in `PageShell` — **nicht ins Root-Layout
  verschieben**. Der Selbstcheck läuft über `CheckShell` und muss markenfrei
  bleiben; Firmenname, Anschrift und Telefon im Kopf wären genau das, was dort
  nicht hingehört.
- `getLocalBusinessSchema()` auf `/kontakt` trägt dieselbe `@id`, damit
  Öffnungszeiten und Geo in dieselbe Entität fließen.
- **Verweise per `@id`, keine ausgeschriebenen Zweitknoten.** Eine anonyme
  zweite `Organization` in `publisher`/`author`/`worksFor` liest sich als
  zweite Firma.
- `npm run pruefe:jsonld` prüft das **ausgelieferte HTML** (19 Seiten): kein
  Typ doppelt, jede `@id` aufgelöst. Nötig, weil Schemas an drei Orten entstehen
  (Views, Sammelfunktionen, `PageShell`) — was am Ende auf einer Seite steht,
  sieht man erst am gerenderten HTML. Statisch Prüfbares zusätzlich in
  `breadcrumb-dubletten.test.ts`.

**llms.txt wird erzeugt, nicht gepflegt** (`npm run llms`). Regel: **Hier steht
nur, was auf der Website steht** — keine Kundennamen ohne `client-results.ts`,
keine Zitate ohne `testimonials.ts`. Ein Test bricht ab, sobald die Dateien vom
Stand der Datendateien abweichen. KI-Systeme lesen sie leichter als das HTML;
eine veraltete Fassung ist teurer als gar keine.

**Suchkonsolen:** Google (URL-Präfix) und Bing bestätigt, Kennungen in
`src/config/suchkonsolen.ts`, ausgegeben vom Root-Layout. ⚠️ **Sie bleiben
dauerhaft stehen** — fällt das Tag weg, verliert die Domain **still** ihren
Status (`suchkonsolen.test.ts`). Der TXT-Eintrag `MS=ms60455894` in der DNS-Zone
ist Microsoft 365, nicht Bing.

⚠️ **Tests, die Quelltext lesen, müssen Kommentare herausschneiden**
(`src/lib/__tests__/quelltext.ts`) — sonst verbietet der Test genau die
Dokumentation, wegen der er existiert. Betrifft `rechtstexte.test.ts` und
`breadcrumb-dubletten.test.ts`.

**Rechtsnormen veralten.** Impressum, Datenschutz und AGB stehen unter
`rechtstexte.test.ts`: **§ 5 DDG** (nicht TMG, abgelöst 14.05.2024) und
**TDDDG** (nicht TTDSG). Eine aufgehobene Vorschrift ausgerechnet auf der Seite,
die Sorgfalt belegen soll, ist ein sichtbarer Mangel.

**KI-Crawler:** `robots.txt` gibt GPTBot, ChatGPT-User, PerplexityBot,
ClaudeBot, Claude-SearchBot und Claude-User frei.

**`FAQPage` nicht ausrollen.** Google hat das Rich Result zum 07.05.2026
abgeschaltet. Auf Startseite und zwei Glossarseiten läuft es weiter (kostet
nichts, andere Systeme lesen es); auf neuen Seiten bringt es nichts.

---

## Blog-Automatik `/gratis-wissen`

Kette unter `scripts/blog-engine/`. Regeln und Bedienung: Skill `blog-seo`.
Einrichtung: `deploy/BLOG-ENGINE.md`.

**Sie läuft: werktags 6:30 per cron, ein Artikel, bis zur ausgelieferten Seite**
(`deploy/blog-automatik.cron`). Ohne `--auto` endet sie beim Entwurf.

**Was auf dem Spiel steht:** Googles Spam-Richtlinie kennt „scaled content
abuse" — viele Seiten, deren Zweck Ranking statt Nutzen ist, *„no matter how
it's created"*. Die Gegenprobe ist *„the extent to which a human being actively
worked to create satisfying content"*. Bewertet wird auf **Website-Ebene** — ein
Urteil zöge `/leistungen` und `/referenzen` mit hinein.

**Auto-Modus (Ansage Ayham, 26.08.2026).** Die Prüfungen bleiben vollständig und
sind an einer Stelle härter als von Hand: **kein `--trotzdem`**, ein harter
Befund blockiert ausnahmslos; Tests und Build laufen zusätzlich **nach** dem
Statuswechsel; ohne `BLOG_ENGINE_FREIGABE_VON` passiert gar nichts. Was entfällt,
ist der Mensch, der die Prüfung auslöst — der Name in `freigabe` bedeutet dann
stehende redaktionelle Verantwortung, nicht „gelesen". Tragweite im Kopf von
`lib/veroeffentlichen.ts`, Tore unter Test. Abschalten: siehe Tabelle oben.

⚠️ Der Auto-Modus stellt nur eigene Dateien bereit (kein `git add -A`) und rebast
vor dem Schieben — aber **ein Deploy liefert alles aus, was in `main` liegt.**
Fremde Commits im Push werden protokolliert, nicht zurückgehalten.

**Das Substanz-Tor:** Jedes Thema in `content/seo/themen-pool.json` trägt
`substanz` — den nicht generierbaren Anteil (gemessene Zahl, echte
Konfiguration, Entscheidung mit Begründung, Fehler mit Kosten, gelesene
Primärquelle). **`substanz: null` ⇒ wird nie produziert.** Ist kein Thema mit
Eigenanteil da, erscheint an dem Tag nichts — vorgesehener Zustand, kein Ausfall.

**Sechs harte Tore** (jedes bricht Build oder Lauf ab): Substanz · ein Keyword,
ein Artikel · keine Fremdzahl ohne `quellen` mit URL und Abrufdatum ·
namentlicher Autor aus `autoren.json`, nie ein Modell · jeder interne Link mit
Ankertext wörtlich im zugewiesenen Absatz · `status: "veroeffentlicht"` verlangt
ein `freigabe`-Objekt.

**Zwei Wege:** `blog:brief` erzeugt ein Briefing aus dem, was im Repo liegt —
kostenlos, ohne Zugangsdaten, geschrieben wird von Hand. Der volle Lauf kostet
rund 44 Cent je Artikel plus DataForSEO und kann dafür die Ergebnisseite lesen.

**Bewusst nicht gebaut:** FAQPage-Schema, `keywords`/`wordCount`/`speakable` im
JSON-LD, Google Indexing API (nur für JobPosting/BroadcastEvent zulässig), ein
Vorschaubild je Artikel (Buildzeit), automatischer Linkaufbau (Richtlinie
verbietet es wörtlich), eine zweite Domain für mehr Volumen.

| Was | Wo |
|---|---|
| Datenmodell (Zod), Qualitätstor | `src/lib/wissen/schema.ts` |
| Laden mit Prüfung — bricht den Build ab | `src/lib/wissen/laden.ts` |
| JSON-LD, interne Verlinkung | `src/lib/wissen/schema-org.ts`, `verlinken.tsx` |
| Hausstil, 81 Regeln | `scripts/blog-engine/lib/qualitaet.ts` |

⚠️ **`generateStaticParams` rendert alle Artikel vor.** Ab etwa 500 Artikeln auf
die neuesten 200 plus `dynamicParams: true` umstellen — Anleitung im Kopf von
`src/app/gratis-wissen/[slug]/page.tsx`.

**Zugangsdaten** in `.env`, nie ins Repo. Geladen von `lib/umgebung.ts`, das in
jedem Einstiegspunkt der **erste** Import sein muss
(`blog-engine-umgebung.test.ts`) — und den Pfad über `process.cwd()` bildet,
weshalb jeder Cron-Aufruf ein `cd` braucht.

**Geschrieben wird über OpenAI** (`lib/openai.ts`, `gpt-5.5`); Anthropic hätte
Vorrang, aber `ANTHROPIC_API_KEY` fehlt. ⚠️ OpenAIs `max_completion_tokens` zählt
die Denk-Token mit, Anthropics `max_tokens` nicht — der Adapter rechnet Spielraum
auf, sonst bricht der Text mit `finish_reason: "length"` ab.

⚠️ **DataForSEO-Guthaben knapp**, `DATAFORSEO_TAGESLIMIT_USD` steht deshalb auf
**0,20** — die Bremse muss unter dem Guthaben liegen.

---

## Sonderseiten mit eigenen Regeln

### Selbstcheck (`/selbstcheck_eu_ai_act`, Alias `/selbstcheck`)

Läuft **markenfrei und außerhalb der Website** (Ansage 11.08.2026): eigener
Rahmen `CheckShell` ohne Logo, ohne Hauptnavigation, ohne Ankündigungsbalken;
eigenes Vorschaubild ohne Logo; `buildMetadata({ ogImage: null, siteName: null })`;
`noindex, nofollow`; in keiner Navigation und keiner Sitemap; kein JSON-LD; null
Nennungen von „KITech". Ausnahmen mit Grund: Rechtstexte klein in der Fußzeile
(§ 5 DDG), CTA auf `/lass-uns-reden`, Domain bleibt `kitech-software.de`.

⚠️ Wer hier Logo oder die normale Fußzeile einbaut, nimmt der Seite genau die
Eigenschaft, für die sie gebaut wurde. Ebenso: Die alte Adresse
`/eu-ai-act-selbstcheck` liefert auf Ansage **404, keine Weiterleitung** — eine
308 wäre genau die Spur in `next.config.ts`, die es nicht mehr geben soll. Der
Unterstrich im Pfad weicht bewusst von kebab-case ab (Vorgabe Ayham); Google
liest `_` nicht als Worttrenner.

### Kampagnenseiten `/funnel` und `/fokus`

Eigene Domains, per `src/proxy.ts` als **Rewrite** (Adresszeile bleibt stehen).
Rahmen ist `FunnelShell` — **keine Kopfleiste**: volle Navigation gäbe kaltem
Traffic ein Dutzend Ausgänge vor dem einen Knopf. `noindex`, keine Sitemap.

**Funnel-Grundsatz (Ansage 19.08.2026):** Lead-Magnet ist bevorzugt ein
**Video**, in dem ein echtes Problem sichtbar gelöst wird — keine PDFs, keine
Checklisten, keine „3 Tipps". Der Wert liegt im Funnel selbst, nicht hinter dem
Call. Verschenkt wird **das Wissen, nicht die Ausführung**. Keine Kundendaten
ohne schriftliche Freigabe. Ausformuliert in
`.claude/skills/funnel-narrativ/reference/substanz.md`.

⚠️ Der aktuelle `/funnel` erfüllt den Grundsatz noch nicht — er bewirbt einen
Workshop, der Einblick entsteht also erst nach der Anmeldung. Offene Punkte im
Kopfkommentar von `src/data/funnel.ts`. `/fokus` ist auf Ansage leer.

### Stellenportal `/karriere`

Die vier Stellen sind Platzhalter (`isPlaceholder: true`). Solange das gilt:
beide Routen `noindex`, nicht in der Sitemap, und **kein `JobPosting`-JSON-LD**
— sonst landen erfundene Stellen in Google for Jobs. Beides hängt am
Datenzustand, nicht an einem Schalter. Bewerbungen per `mailto:` an
`info@kitech-software.de`.

### Kundenkarten und Bewertungen

`src/data/client-results.ts`. **Die Karte führt mit dem Ergebnis** — Kennzahl
groß, dann Label, ein Satz, Belege, Live-Link. Wer sie entkernt, nimmt der
Startseite ihren einzigen harten Beweis.

- `liveUrl` = das gebaute Produkt („Live im Einsatz"), `companyUrl` = die
  Website des Kunden. Nur mit geprüfter Adresse füllen.
- `klickZiel: "live"` schickt die ganze Karte auf `liveUrl` statt auf die
  Detailseite (so bei klargehalt.de).
- `label`/`summary` dürfen `duration`, `before`/`after` und `review` **nicht**
  wiederholen — die rendert die Karte bereits als eigene Zeilen.
- ⚠️ **Bewertungen und Sterne nur mit Beleg.** `review` nur füllen, wo der Satz
  wörtlich so abgegeben wurde. Erfundene Bewertungen sind nach **Anhang zu § 3
  Abs. 3 Nr. 23c UWG** abmahnbar (Schwarze Liste, ohne Interessenabwägung).
  Aktuell schriftlich belegt: Dennis Mikyas, Eugen Kretschmann.

### Popup auf der Startseite

`CallPopup.tsx`, Zeiten in `src/data/call-popup.ts`. Nur auf `/`. Öffnet
frühestens nach **25 s** und dann erst bei **6 s Ruhe**, spätestens nach 75 s;
bei Erstbesuchern erst nach entschiedenem Cookie-Banner.

⚠️ **Je kürzer die Mindestdauer, desto größer das Ranking-Risiko.** Google
wertet Overlays, die auf dem Handy kurz nach dem Laden den Inhalt verdecken, als
„intrusive interstitial" — und die Startseite ist die Seite, die ranken soll.

---

## Sicherheit und DSGVO

**Security-Header** stehen in `next.config.ts` (`headers()`), nicht in einer
nginx-Datei: CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
Referrer-Policy, Permissions-Policy, COOP; `X-Powered-By` aus.

⚠️ **Die CSP kennt nur die eigene Domain, Plausible und Calendly.** Wer eine
neue externe Verbindung einbaut, trägt sie dort ein — sonst blockiert der
Browser sie stillschweigend.

**Consent:** `CookieConsent.tsx` + `lib/consent.ts` (localStorage-Key
`cookie-consent-v1`), eine Kategorie „Analytics". Plausible **und** das
Calendly-Embed laden erst nach Zustimmung — Calendly setzt echte
Third-Party-Cookies und gilt hier nicht als technisch notwendig.
Einstellungen jederzeit über den Fußzeilen-Link
(`window.dispatchEvent(new Event("cookie-consent:open"))`).

**Nie ins Repo:** Zugangsdaten, Schlüssel, Secrets. `.env` lokal, in Coolify
Environment-Variablen.

---

## Benachrichtigungen

| Weg | Wofür |
|---|---|
| `src/app/api/ereignis/route.ts` + `lib/ereignis.ts` | Sofortmeldung an `EREIGNIS_WEBHOOK_URL` (Besuch, Termin geöffnet, Popup/Telefon/E-Mail geklickt, Selbstcheck fertig) |
| `src/app/api/tagesbericht/route.ts` | Zahlen des Vortags aus der Plausible-Query-API, geschützt mit `TAGESBERICHT_SECRET` |
| `scripts/tagesbericht/sende_tagesbericht.py` | Der tatsächlich laufende Weg: Cron 8:00 Europe/Berlin, Microsoft Graph. Fragt Plausible **direkt** ab, damit Erweiterungen keinen Deploy kosten |
| `src/app/api/funnel-besuch/route.ts` | Dasselbe für `/funnel` und `/fokus` (älter; gehört mittelfristig zusammengelegt) |

`meldeEreignis()` klingelt, `trackEvent()` (Plausible) zählt — nicht verwechseln.

**Ohne Einwilligung** läuft nur das Ereignis selbst (Seite, Referrer, Kampagne):
kein Cookie, keine IP im Webhook, § 25 TDDDG greift nicht. **Mit Einwilligung**
zusätzlich die Firmenerkennung über ipinfo.io — serverseitig, nur wenn
`IPINFO_TOKEN` gesetzt ist. Cookie-Banner und `/datenschutz` benennen sie beide.

**n8n entscheidet, was klingelt** (`deploy/n8n-benachrichtigung.json`, drei
Knoten): Ein *Besuch* nur, wenn ipinfo eine **echte Firma** liefert — bei einem
Privatanschluss steht dort der Provider, nicht der Besucher. *Kontaktsignale*
(Telefon, E-Mail, Popup, Termin, Selbstcheck) gehen immer raus.

⚠️ **Der Meldeweg fällt lautlos aus.** Die Route antwortet **immer** 204 — auch
ohne `EREIGNIS_WEBHOOK_URL` und auch, wenn n8n wegbricht. Der Webhook meldet
„Workflow was started", bevor etwas passiert ist, und ein Code-Node mit
`return []` endet mit `success`. **Der Statuscode beweist nichts.** Ob eine
Meldung ankam, steht nur in n8n (Workflow `mE5M1CqXse3jETgU`, Zugang in `.env`)
oder im Postfach. Kostete zweimal Tage: erst leere Mails, dann keine.

⚠️ **Der Tagesbericht untererfasst** — wer den Banner ablehnt, taucht in keiner
Zahl auf; unter jeder Mail steht deshalb ein Satz dazu. Und **„wer war das"
beantwortet Plausible nicht**: keine Profile, keine Wiedererkennung. Ohne
`PLAUSIBLE_API_KEY` antwortet der Bericht mit 404.

**Analytics:** Plausible self-hosted auf `stats.kitech-software.de`, hardcoded in
`lib/plausible.ts` und `CookieConsent.tsx` (die `VITE_PLAUSIBLE_*` in
`.env.example` sind tot). Events: `CTA_Klick`, `Kontaktformular_gesendet`,
`Calendly_Klick`, `Scroll_90`, `Angebot_Seite`, `Lead_Qualifier_abgeschlossen`,
`Telefon_Klick`, `Email_Klick`.

---

## Hosting und Deploy

Selbstgehostet über **Coolify** (VPS), Application „KITech Website",
UUID `j9vencbq8b2nugo86eimxnku`, Dashboard `http://localhost:8000`, Token in
`/home/deploy/KITech/infra/secrets/coolify-api-token.env`.
Build Pack **`dockerfile`**, Port **3000**, Node **22**, Branch **`main`**.

**Es gibt keinen funktionierenden GitHub-Webhook.** Deploys laufen manuell über
die API — **nach explizitem Go**, nicht nach jedem Push:

```bash
curl -X GET "http://localhost:8000/api/v1/deploy?uuid=j9vencbq8b2nugo86eimxnku" \
  -H "Authorization: Bearer $COOLIFY_API_TOKEN"
```

**Vor jedem Deploy** gegen den Container prüfen — Coolify nutzt dasselbe
Dockerfile, was hier bricht, bricht auch dort:

```bash
npm run lint && npm test && npm run build
bash scripts/pruefe-container.sh      # baut, ruft 25 Routen ab, prüft JSON-LD, räumt auf
```

`npm start` taugt wegen `output: "standalone"` nur eingeschränkt — für eine
echte Prüfung immer den Container nehmen.

⚠️ **Mehrere Sessions teilen sich diesen Arbeitsbaum.** Vor Commit und Deploy
`git status --short` und `git log --oneline -3` lesen: ein Deploy liefert alles
aus, was gerade in `main` liegt. Welcher Commit läuft, verrät der Image-Tag:
`docker ps | grep j9vencbq`.

**Env in Coolify:** gesetzt ist nur `NIXPACKS_NODE_VERSION` (Altlast, ohne
Wirkung). Offen: `LOGTO_*` (eingeloggter Bereich, noch nicht freigeschaltet).
Runtime-Variablen brauchen nur einen Neustart, `NEXT_PUBLIC_*` einen Rebuild.

**Domains:** `kitech-software.de` (+ `www` per 308 auf Apex),
`funnel.` und `fokus.` per Rewrite, `app.` für den eingeloggten Bereich.

---

### Entfernt, aber wiederherstellbar

**Community und Mitgliederbereich**, am 05.08.2026 auf Ansage entfernt: die
Skool-Gruppe war nicht startklar, und ein angekündigter Mitgliederbereich ohne
Termin ist ein Versprechen, das niemand einlöst. `/community` und `/skool`
leiten per 308 auf die Startseite.

Code in Commit **`31a655b`** — ⚠️ **der Hash allein genügt nicht.** Dazu:
`navigation.ts` (Kopfzeile, Fußzeile, `siteRoutes`), `company.skoolUrl`,
`WAITLIST_WEBHOOK_URL` in `.env.example`, Redirect in `next.config.ts` zurück.

Nicht betroffen: der eingeloggte Bereich `src/app/app/` (LogTo) — weiterhin da,
nur nicht angekündigt.

---

## Firmendaten

**Eine Quelle: `src/config/company.ts`.** Ausgenommen sind die Rechtstexte,
wo die Angaben bewusst wörtlich im Text stehen.

| | |
|---|---|
| Sichtbar überall | **KITech Software** (`shortName`) |
| Impressum, Datenschutz „Verantwortliche Stelle", AGB § 1 | volle Firmierung — das ist die Rechtsperson, keine Marke |
| JSON-LD | `name` kurz, Firmierung in `legalName` |
| Telefon | **+49 151 64682544** — die eine, kanonische Nummer, identisch im Google Business Profile |
| E-Mail | info@kitech-software.de · aalkh@kitech-software.de (Ayham) |
| Adresse | Wedekindstraße 14, 30161 Hannover · Geo 52.3859/9.7529 |
| Register | HRB 230077 (Amtsgericht Hannover), gegründet 16.01.2026 · USt-IdNr. DE459778632 |
| LinkedIn | linkedin.com/in/ayham-alkhalil-66bb451b5 |

⚠️ **NAP-Konsistenz:** Name, Adresse und Telefon müssen über Website, Google
Business Profile und Verzeichnisse **identisch** sein — zwei Nummern heißen: keine
bestätigt die andere. `nap-konsistenz.test.ts` prüft Impressum, Datenschutz,
JSON-LD, StickyMobileCTA und llms.txt gegen `company.phone`.

`sameAs` enthält nur Profile, die KITech gehören: LinkedIn, ProvenExpert, Google
Business Profile (per CID, nicht per `share.google`-Link). Creditreform und
Companyhouse sind abgeschriebene Registerdaten und antworten Crawlern mit 403.

---

## Offen

Stand 26.08.2026.

| Was | Wer |
|---|---|
| ⚠️ **DataForSEO nur noch 0,45 $** — reicht für gut zwei Auto-Läufe, danach schreibt die Automatik ohne Keyword-Daten weiter | Ayham |
| ProvenExpert-Profil hat **0 Bewertungen** — fünf echte würden zugleich die Sterne auf den Kundenkarten belegen (`deploy/BEWERTUNGEN.md`) | Ayham |
| `openPoints` der sechs Referenzfälle — solange sie stehen, ist **keine** Detailseite indexiert | Kundenfreigaben |
| Themen-Cluster ohne Artikel — `content/seo/cluster.json` gegen `content/wissen/` (5 von 12) | Redaktion |
| `techStack` in `services.ts` (PyTorch, Kubernetes, LangChain) ist Altbestand der Vorgängerseite | inhaltliche Entscheidung |
| KI-Partner-Verzeichnis der Wirtschaftsförderung Region Hannover: Aufnahme | Ayham |
| Sales Letter und `/funnel` tragen Platzhaltertext | Ayham |
| `/api/funnel-besuch` und `/api/ereignis` gehören zusammengelegt | technische Schuld |
