# CLAUDE.md – KITech Software Website

> Technische Projektdokumentation für KI-Assistenten und Entwickler.

---

## Projekt-Überblick

**Website:** [kitech-software.de](https://kitech-software.de)
**Typ:** Corporate Website / Marketing-Seite
**Unternehmen:** KITech Software UG (haftungsbeschränkt) – KI-Beratung & Softwareentwicklung für den deutschen Mittelstand
**Standort:** Hannover, Deutschland
**Geschäftsführer:** Ayham Alkhalil
**Sprache:** Deutsch (de_DE)

**Stand 19.08.2026 — Blog-Automatik für `/gratis-wissen`:** Der Wissensbereich
ist von einer TypeScript-Datei auf **eine JSON-Datei je Artikel** umgestellt
(`content/wissen/<slug>.json`), bekommt **Autorenseiten** (`/autoren/<slug>` mit
`ProfilePage`-Auszeichnung), **Themenseiten** (`/gratis-wissen/thema/<slug>`) und
einen **RSS-Feed**. Dazu eine Automatik unter `scripts/blog-engine/`, die
Themen bewertet, Ergebnisseiten analysiert, die rankende Konkurrenz liest,
schreibt, gegen 81 Hausstilregeln prüft und den Artikel in den Bestand
einhängt — **und beim Entwurf aufhört.** Freigabe, Commit und Deploy bleiben
menschliche Schritte. Siehe [Blog-Automatik](#blog-automatik) und
`deploy/BLOG-ENGINE.md`.

Im selben Zug geradegezogen: `priority` und `changeFrequency` sind aus Sitemap
und Routen-Register **entfallen** (Google ignoriert beide ausdrücklich), die
Artikelseiten sind **Server Components** statt Client Components, `robots.txt`
kennt jetzt `Claude-SearchBot` und `Claude-User`, und die Rechtsnorm für
erfundene Bewertungen ist **korrigiert**: nicht § 5b Abs. 3 UWG (das ist die
Informationspflicht), sondern der **Anhang zu § 3 Abs. 3 Nr. 23c UWG** — die
Schwarze Liste, die ohne Interessenabwägung greift.

**Stand 23.08.2026 — Konsolidierung: was aus mehreren Sessions zusammengezogen
und in einem Zug deployt wurde.** Auf Ansage („alles glattziehen, in einem Zug
deployen, Deploy-Architektur prüfen"). Vier Befunde, die keiner der Einzelaufträge
gesucht hatte:

- **Das Impressum berief sich auf § 5 TMG.** Das Telemediengesetz ist am
  14.05.2024 durch das Digitale-Dienste-Gesetz abgelöst worden; die
  Impressumspflicht steht seither in **§ 5 DDG**. Genau dieser Fehler war am
  21.08.2026 in `llms.txt` gefunden und dort per Test abgesichert worden — die
  Seite, um die es eigentlich ging, lag außerhalb der Prüfung. Neu:
  [`src/lib/__tests__/rechtstexte.test.ts`](src/lib/__tests__/rechtstexte.test.ts)
  deckt Impressum, Datenschutz und AGB ab und kennt auch TTDSG→TDDDG.
- **Die Blog-Engine hat `.env` nie gelesen.** Sie fragte `process.env` ab, aber
  weder `dotenv` noch ein `--env-file`-Flag füllten es; `tsx` lädt von sich aus
  nichts. Wer `DATAFORSEO_LOGIN` korrekt einträgt, bekam trotzdem
  „DATAFORSEO_LOGIN fehlt" — und suchte beim Zugang statt beim Laden. Siehe
  [Zugangsdaten der Blog-Automatik](#zugangsdaten-der-blog-automatik).
- **Der Cookie-Banner ragte bei 768 px über den Bildschirmrand** — auf *jeder*
  Seite, gemessen 31 px. 768 px ist das iPad im Hochformat, und der Banner ist
  das erste, was ein Erstbesucher sieht. Siehe
  [Cookie-Banner bricht erst ab `dt` um](#cookie-banner-bricht-erst-ab-dt-um).
- **Der Container lief auf Node 20** — seit April 2026 End-of-Life, also ohne
  Sicherheitsupdates. Jetzt `node:22-alpine`, dieselbe Hauptversion, gegen die
  hier lokal getestet wird. `engines` in `package.json` schreibt es fest.

Ein fünfter Befund kam bei der Nachprüfung dazu: **`/glossar` gab zwei
BreadcrumbList-Knoten für denselben Pfad aus** — einen aus
`buildGlossaryIndexSchema()`, einen zusätzlich aus der View, unterschieden nur
in der Beschriftung des ersten Elements („Start > Glossar" gegen „Startseite >
Glossar"). Das ist kein Alternativpfad, sondern eine Dublette; welchen Google
für das Suchergebnis nimmt, ist dann Zufall. Im Quelltext war das nicht zu
sehen — die View spreadete eine Funktion, die mehrere Schemas liefert. Siehe
[JSON-LD prüfen](#json-ld-des-ausgelieferten-html-prüfen).

Dazu geradegezogen: der ODR-Link im Impressum brach bei 320 px nicht um (4 px
Overflow, jetzt `break-words`), `lastModified` für `/impressum` steht auf dem
23.08., und die acht losen Arbeitsdateien aus dem Projektwurzelverzeichnis
liegen in `.tmp/vorlagen/` mit einer Notiz, was sie sind.

Gemessen statt behauptet: 140 Messungen über 20 Routen × 7 Breiten (320–1024 px)
gegen den Container → **0 horizontaler Overflow, 0 Textüberlauf, 0 echte
Tippziel-Befunde** (19 Ziele unter 24 px fallen sämtlich unter eine
WCAG-2.2-Ausnahme: 3 inline, 16 mit ausreichendem Abstand). Alle 27 Routen im
Container mit erwartetem Status, `/gibt-es-nicht` mit 404.

**Stand 23.08.2026 — Leon ist von der Website genommen.** Auf Ansage: „Leon
soll überall raus. Er ist kein Geschäftsführer!" Betroffen waren fünf Stellen:
die Zeile „Vertreten durch" im **Impressum** (dort stand „Ayham Alkhalil,
L. Battel"), der Eintrag in `src/data/team.ts`, die Teamliste neben dem
Gründerwort (`teamNamen` in `src/data/gruenderwort.ts`), der Autoreneintrag in
`content/seo/autoren.json` samt Autorenseite `/autoren/leon-battel`, und das
Portrait `public/images/team/leon.webp`. `npm run llms` ist nachgezogen.

Zwei Dinge, die daran hängen:

- **Fünf Themen im Vorrat** (`content/seo/themen-pool.json`, E-Rechnung und
  Belegverarbeitung) waren ihm als Autor zugewiesen und stehen jetzt auf
  `ayham-alkhalil`. Ohne das hätte der erste Blog-Lauf zu einem dieser Themen
  einen Artikel erzeugt, dessen Autor nicht in `autoren.json` steht — und der
  Loader bricht den Build genau daran ab.
- **`/autoren/leon-battel` liefert jetzt 404.** Die Seite stand in der Sitemap
  und war indexiert; die Adresse fällt aus dem Index. Bewusst keine
  Weiterleitung — es gibt kein Ziel, das dasselbe bedeutet.

⚠️ **Rechtlich zu klären, nicht im Code:** § 5 Abs. 1 Nr. 1 DDG verlangt im
Impressum **alle** Vertretungsberechtigten. Ist L. Battel im Handelsregister
(HRB 230077) weiterhin als Geschäftsführer eingetragen, ist die Kurzfassung ein
abmahnfähiger Verstoß — dann gehört er zurück ins Impressum, unabhängig davon,
wie er auf der Website sonst auftritt. Ist er ausgetragen (oder war es nie),
passt der Stand so.

Nicht angefasst: der Absender des Tagesberichts
(`leon.battel@kitech-software.de`, Microsoft Graph, siehe
[Tagesbericht](#der-tägliche-bericht-kommt-per-e-mail)) — das ist Infrastruktur
außerhalb der Website und wäre ein eigener Umbau.

**Stand 21.08.2026 — Sichtbarkeitsprüfung und was daraus folgte.** Eine
vollständige SEO- und GEO-Prüfung gegen die Live-Domain (Lighthouse, curl,
Auswertung aller vorgerenderten HTML-Dateien) hat sechzehn Befunde ergeben; die
Punkte, die im Code lagen, sind abgearbeitet. Der Reihe nach:

- **`llms.txt` und `llms-full.txt` werden jetzt erzeugt, nicht gepflegt**
  (`npm run llms`, [Skript](scripts/llms-txt.ts)). Beide waren seit dem
  08.07.2026 unverändert und beschrieben eine Website, die es nicht mehr gab —
  inklusive der ROI-Garantie und eines Testimonials von „Frank Locke", das am
  02.08. als erfunden entfernt worden war. Siehe
  [llms.txt](#llmstxt-wird-erzeugt-nicht-gepflegt).
- **`www` leitet per 308 auf die Apex-Domain.** Vorher lieferte
  `www.kitech-software.de` für jede Adresse eine 200 — die komplette Website lag
  zweimal im Netz.
- **Der Organisations-Knoten existiert.** `getOrganizationSchema()` war gebaut,
  getestet und auf **keiner** Seite eingebunden; alle `publisher`-Verweise der
  Artikel zeigten ins Leere. Er steht jetzt in `PageShell` — bewusst nicht im
  Root-Layout, siehe [Entitäts-Knoten](#entitäts-knoten-organisation-und-website).
- **Das Vorschaubild liegt auf der eigenen Domain** statt auf einem fremden
  Google-Bucket, und es ist 1200x630 statt 1024x1024 (`npm run og`).
- **Das Logo ist von 178 KB auf 5,6 KB geschrumpft** — es war ein Rasterbild in
  einer SVG-Hülle und die größte Ressource der Website.
- **LCP:** Auf Artikelseiten war das größte gezeichnete Element der
  **Cookie-Banner**, nicht der Artikel. Siehe [LCP](#lcp-was-gemessen-wurde).
- **Titel und Beschreibungen** liegen im Korridor, geprüft von
  `src/lib/__tests__/metadaten.test.ts`.
- **Der Glossareintrag `/glossar/roi-garantie` ist neutral**, die Garantie wird
  KITech dort nicht mehr zugeschrieben.

**Was bewusst offen bleibt** (nichts davon liegt im Code): die `openPoints` der
sechs Referenzfälle brauchen Kundenfreigaben, und zehn von zwölf Themen-Clustern
haben keinen Artikel.

ℹ️ **Am 24.08.2026 erledigt:** Search Console und Bing Webmaster Tools sind
eingerichtet und bestätigt (siehe [Suchkonsolen](#suchkonsolen-google-und-bing)),
`INDEXNOW_KEY` läuft, und `DATAFORSEO_*` sowie `FIRECRAWL_API_KEY` sind
eingetragen und geprüft. Es fehlt allein `ANTHROPIC_API_KEY` — und der wird für
den Handweg nicht gebraucht.

**Stand 20.08.2026 — was zuletzt geändert wurde:** Die beiden Sales Letter
stehen **nicht mehr in der Fußzeile** (auf Ansage); erreichbar bleiben sie über
„Warum?" und die Segmentseiten. Und es läuft ein **täglicher Besucherbericht
per E-Mail** — jeden Morgen um 8:00, siehe [Der tägliche Bericht kommt per
E-Mail](#der-tägliche-bericht-kommt-per-e-mail).

**Stand 19.08.2026 — Funnel-Grundsatz ergänzt:** Funnels sind **nicht** die
allgemeine Website und werden nicht wie klassische PDF-Leadmagneten gebaut.
Siehe [Funnel-Grundsatz](#funnel-grundsatz): In Funnels soll KITech tiefe,
normalerweise nicht oeffentlich sichtbare Einblicke in echte Loesungen geben —
vor allem ueber Videos, in denen konkrete Probleme direkt geloest werden.

**Stand 17.08.2026 — was zuletzt geändert wurde:** Die **Bilder sind neu
geordnet**: alle inhaltlichen Bilder liegen unter `public/images/`
(`team/`, `referenzen/portraits/`, `referenzen/logos/`), Wegweiser in
[`public/images/README.md`](public/images/README.md). Ein neues Foto braucht
damit keine Import-Zeile mehr — Datei ablegen, Pfad eintragen. Die Referenz
**klargehalt.de zeigt keine Person mehr**, sondern die Wortmarke: der Mensch
dahinter stand damals im Team, und derselbe Mensch als Kunde ist kein Beleg. Das **Team steht
seitlich neben dem Gründerwort** statt in großen Kacheln, mit der Einladung
„Du willst dabei sein?" auf `/karriere`. **Jörg Kratzat** hat ein Foto und
steht jetzt als Vertrieb für IT und SaaS (er tauchte kurzzeitig als zweite
Person „York" auf — Sprachnachricht, gleiche Person, zusammengeführt).
(Der am selben Tag ergänzte Eintrag „Technical Accountant" ist am 23.08.2026
wieder entfallen, siehe oben.)

Zuletzt am selben Tag: die **klargehalt-Karte führt direkt auf klargehalt.de**
statt auf ihre Detailseite (Feld `klickZiel` in `src/data/client-results.ts`),
und der **Abschluss-Knopf ist repariert** — er hatte eine feste Höhe, aus der
die längere Beschriftung oben und unten herauslief. Siehe
[Knöpfe ohne feste Höhe](#knoepfe-ohne-feste-hoehe).

Ebenfalls am selben Tag: der **Ankündigungsbalken führt mit einer Frage statt
mit dem Produktnamen** — „Find heraus, ob du KI richtig nutzt" statt
„1:1-KI-Check 2026" (`src/config/announcement.ts`, auf Ansage). Der „NEU"-Badge
ist dabei entfallen: er kündigte das Produkt an, und ohne ihn bleibt der Balken
auf dem Handy zweizeilig statt dreizeilig. Die Verfügbarkeitszeile dahinter ist
unverändert.

**Stand 14.08.2026 — was davor geändert wurde:** Vier Dinge. Das
**Startseiten-Popup wartet jetzt auf eine Lesepause** statt sofort
aufzugehen (Ranking, siehe [Popup](#popup-auf-der-startseite)). Unter dem
Kundenlaufband stehen wieder Inhalte: **Gründerwort und FAQ**
(`src/data/gruenderwort.ts`, `src/data/faq.ts`). Der **1:1-KI-Check dauert
wieder 30 Minuten** statt 60 — eine Zahl in `src/config/angebot.ts`, **der
Calendly-Termintyp muss nachgezogen werden**. Und der **blaue Marker hinter
Überschriften ist auf allen Seiten raus** (`/warum`, `/solo`, `/enterprise`,
Sales Letter, Selbstcheck) — Ausnahme `/funnel`, wo parallel gearbeitet wurde.

Dazu ist das **Besuchertracking neu gebaut** worden, siehe
[Benachrichtigungen](#benachrichtigungen-ereignisse-und-tagesbericht): der alte
Weg meldete seit dem Umzug an eine Adresse, die es nicht mehr gibt, und trug
Token und Secret im Client-Bundle spazieren.

**Stand 13.08.2026 — was davor geändert wurde:** Die Startseite hat ein
**Popup** („Buch dir einen Call.").

**Stand 12.08.2026 — was davor geändert wurde:** Das kostenlose Angebot heißt
jetzt **1:1-KI-Check** (`src/config/angebot.ts`, eine Quelle für Balken, Knöpfe
und Terminseite) und läuft **jeden Donnerstag mit fünf Plätzen** — der Wochentag
steht in `CHECK_TAG` und **muss zum Calendly-Kalender passen**. `/lass-uns-reden`
ist neu gebaut (Termin, dann Anrufen/WhatsApp/E-Mail, sonst nichts) und trug bis
dahin als einzige Seite noch die ROI-Garantie „Erreichen wir das Ziel nicht,
zahlen Sie nicht" — sie ist dort jetzt ebenfalls raus. Der Menüpunkt „Warum?" ist
aus der Kopfzeile genommen (Seiten bleiben erreichbar), an seiner Stelle steht
**/gratis-wissen**. Die Leistungen sind von sechs auf vier Schritte gekürzt, mit
Enterprise-Betrieb (AWS/Azure/eigenes Haus) als eigenem Punkt. Der Referenzfall
„Lead-Pipeline" (Felix Bechtoldt) ist entfernt.

**Aktueller Status:** Die Website wurde am 30.07.2026 von **Vite + React Router auf Next.js (App Router) migriert** — Grund: die Funnel-Seiten sollen organisch ranken, was mit einer Client-Side-SPA nicht geht.

**Am 05.08.2026 ist der Relaunch live gegangen** (Commit `82bf44e`, deployt und gegen die Live-Domain geprüft). Bis dahin lag der komplette Migrationsstand unversioniert im Arbeitsverzeichnis; er steckt jetzt in `main` und ist deployt. Im selben Zug wurde die **Startseite überarbeitet**: der Hero auf eine einzige Aussage reduziert, die Kundenkarten mit Beleglinks auf die gebauten Produkte versehen und das Team um Rollen, Kurzbeschreibungen und LinkedIn ergänzt — siehe [Startseite](#startseite-hero-und-team) und [Kundenkarten](#kundenkarten-ergebnis-beleglinks-fotos-sterne). Die alte Baustellen-Weiche (`src/App.tsx` → `UnderConstruction.tsx` für fast jeden Pfad) gibt es nicht mehr. Gleichzeitig wurde Coolify von `nixpacks` auf **`dockerfile`** umgestellt — ohne das läuft Next.js dort nicht. Siehe [Seiten & Routing](#seiten--routing) und [Hosting](#hosting).

**Ebenfalls am 05.08.2026: die Seitenarchitektur ist geradegezogen worden.** Vorher
pflegten Kopfzeile, Fußzeile und Sitemap je eine eigene Pfadliste, sechs Seiten
trugen dieselbe Fußzeile als Kopie, drei verschiedene Containerbreiten ließen das
Logo beim Seitenwechsel springen, und die Rechtstexte hingen noch am alten Layout
mit einem völlig anderen Header. Sechs Routen zeigten die Baustellenseite, obwohl
ihr Inhalt längst im Repo lag. Jetzt gilt:

- **Eine Quelle für Navigation und Routen:** `src/config/navigation.ts` speist
  Kopfzeile, Fußzeile, Sitemap und den Routen-Test. Firmendaten (Adresse,
  Telefon, E-Mail) stehen in `src/config/company.ts`.
- **Ein Rahmen für alle Seiten:** `PageShell` (Hintergrund + `SiteHeader` +
  `SiteFooter`), Breite überall `SITE_CONTAINER` (1180 px).
- **Navigationspunkt „Warum?“** fasst die beiden Funnel-Seiten zusammen, die
  vorher mit vollem Titel die Leiste allein füllten.
- **Neu erreichbar:** `/warum`, `/leistungen`, `/haltung`, `/kontakt`, `/glossar`
  (+ Detailseiten), `/solo`, `/enterprise`, `/karriere` (+ Detailseiten).
- **`npm test` prüft jeden internen Link** gegen die tatsächlich vorhandenen
  Routen — siehe [Routen-Test](#routen-test).

---

## Commands

```bash
npm run dev        # Dev-Server auf Port 8080
npm run build      # Production Build
npm start          # Production-Server auf Port 8080 (setzt npm run build voraus)
npm run lint       # ESLint
npm test           # Vitest

npm run llms       # llms.txt + llms-full.txt neu erzeugen
npm run og         # Standard-Vorschaubild neu rendern (braucht Chrome)

# Blog-Automatik (siehe deploy/BLOG-ENGINE.md)
npm run blog:lauf -- --trocken   # zeigt, was passieren würde. Kostet nichts.
npm run blog:lauf -- --anzahl 2  # zwei Entwürfe erzeugen
npm run blog:pruefen -- -v       # Hausstil aller Artikel prüfen
npm run blog:freigeben -- <slug> --von "Name"
npm run blog:indexnow            # nach dem Deploy
npm run blog:backlinks           # Outreach-Ziele finden
```

`npm run preview` gibt es nicht mehr — das war ein Vite-Script.

Tests mit Vitest (`npm test`) — Vitest laeuft weiterhin ueber Vite (`vitest.config.ts`), unabhaengig vom Next.js-Build. Das ist Absicht: die Tests pruefen reine TS-Module und lesen einzelne Alt-Seiten per `?raw`-Import (ein Vite-Feature).

Dies ist ein **Next.js 16 Projekt mit App Router** unter `src/app/`. Seiten werden serverseitig gerendert bzw. beim Build statisch vorgeneriert. Die Seiten-Komponenten liegen in `src/views/` (bewusst **nicht** `src/pages/`, das Next.js als Pages Router interpretieren wuerde) und sind Client Components; die Dateien unter `src/app/*/page.tsx` sind duenne Server-Wrapper, die nur `metadata` exportieren.

---

## Tech-Stack

| Kategorie | Technologie | Version |
|---|---|---|
| UI-Bibliothek | React | 19.2.x |
| Framework/Build | Next.js (App Router, Turbopack) | 16.2.x |
| Sprache | TypeScript | 5.8.x |
| Styling | Tailwind CSS | 3.4.x |
| Animationen | Framer Motion | 12.x |
| Routing | Next.js App Router (dateibasiert) | – |
| UI-Komponenten | shadcn/ui (Radix UI) | – |
| Icons | Lucide React | – |
| Font | Onest (via @fontsource) | – |
| Theme | next-themes | 0.3.x (siehe Hinweis unter [Design System](#design-system)) |
| State/Data | TanStack React Query | 5.83.x |
| Forms | React Hook Form + Zod | – |
| Toasts | Sonner + Radix Toast | – |
| Analytics | Plausible (self-hosted, hardcoded — siehe [Analytics](#analytics-plausible)) | – |
| Paketmanager | npm (kein Bun — `bun.lockb` existiert nicht mehr) | – |

---

## Projektstruktur

```
/
├── public/
│   ├── favicon.ico            # Favicon
│   ├── robots.txt             # SEO + KI-Crawler-Freigaben
│   ├── llms.txt                # Kurzuebersicht fuer KI-Agenten — ERZEUGT (npm run llms)
│   ├── llms-full.txt           # Ausfuehrliche Doku fuer KI-Agenten — ERZEUGT (npm run llms)
│   ├── images/                  # ★ ALLE inhaltlichen Bilder (siehe images/README.md)
│   │   ├── team/                #   eigene Leute (ayham, ayham-hero, joerg)
│   │   ├── referenzen/portraits/ #   Kundengesichter
│   │   ├── referenzen/logos/    #   Kundenlogos
│   │   └── og/                  #   Social-Vorschaubilder
│   └── logo.png                 # Echtes, lokal gebuendeltes Logo
├── content/                     # ★ Redaktionelle Inhalte als JSON, von der Automatik beschrieben
│   ├── wissen/                  #   eine Datei je Artikel — der Dateiname ist die URL
│   └── seo/                     #   autoren.json, cluster.json, themen-pool.json, laeufe/
├── scripts/
│   └── blog-engine/             # ★ Die Blog-Automatik (siehe deploy/BLOG-ENGINE.md)
│       ├── lauf.ts              #   der tägliche Lauf — endet beim Entwurf
│       ├── freigeben.ts         #   der eine Schritt, den ein Mensch macht
│       ├── lib/                 #   dataforseo, firecrawl, claude, qualitaet, indexnow
│       ├── schritte/            #   01 Themen … 09 Ablegen
│       └── prompts/             #   hausstil.md wird als System-Prompt geschickt
├── deploy/
│   ├── BLOG-ENGINE.md           # Einrichtung der Blog-Automatik, Kosten, Not-Aus
│   └── COOLIFY.md               # Deployment-Anleitung (nginx.conf/security-headers.conf entfallen)
├── Dockerfile                  # Multi-Stage (node:20-alpine, Next standalone, Port 3000) - der aktive Build Pack
├── next.config.ts              # Security-Header, CSP, Redirects (/skool, /community -> /), output: standalone
├── src/
│   ├── proxy.ts                # Host-Rewrite: app.kitech-software.de -> /app/*
│   ├── index.css               # Design Tokens (CSS Custom Properties) - dark-first, siehe Design System
│   ├── assets/                 # Logos, Fotos (importiert als ES6-Module)
│   ├── config/                  # ★ navigation.ts (Navigation + Routen-Register), company.ts (Firmen-/Kontaktdaten)
│   ├── data/                    # Inhalte, getrennt von der Darstellung:
│   │                            #   client-results, testimonials, team, sales-letters,
│   │                            #   glossary, services, principles, segments, jobs
│   ├── components/
│   │   ├── layout/             # ★ PageShell (Rahmen aller Seiten), SiteHeader, SiteFooter,
│   │   │                        #   SignalBackdrop, site-container.ts (SITE_CONTAINER/TEXT_CONTAINER)
│   │   │                        #   Header/Footer/Layout/FunnelLayout = Alt-Layout, nur noch fuer legacy/
│   │   ├── seo/                # StructuredData (JSON-LD)
│   │   ├── sections/           # PageHeading, NavCard, CtaBanner (Basis fuer FinalCta/ReferenceCta),
│   │   │                        #   ClientResults, TeamSection,
│   │   │                        #   HeroMedia, FounderPortrait, SalesLetter
│   │   ├── conversion/         # StickyMobileCTA, ExitIntentPopup, TrustRiskReversal
│   │   ├── canvas/              # SignalField (Canvas-basierte Hintergrund-Animation)
│   │   ├── ui/                  # shadcn/ui Komponenten (nicht manuell bearbeiten)
│   │   ├── CookieConsent.tsx   # DSGVO Cookie-Banner + Plausible-Injection
│   │   └── NavLink.tsx
│   ├── hooks/                   # use-mobile, use-toast
│   ├── lib/
│   │   ├── utils.ts             # cn/clsx
│   │   ├── plausible.ts        # trackEvent(), Scroll-Tracking - Consent-gated
│   │   ├── consent.ts          # Zentrale Consent-Logik (localStorage-Key cookie-consent-v1), von CookieConsent.tsx UND LassUnsReden.tsx genutzt
│   │   ├── visitor-enrichment.ts
│   │   ├── schema-validators.ts # Zod-Schemas fuer die JSON-LD-Tests
│   │   ├── glossary-schema.ts
│   │   ├── metadata.ts          # buildMetadata() - ersetzt die alte SEOHead-Komponente
│   │   └── __tests__/           # Vitest: Schemas, Breadcrumbs + routes.test.ts (Link-/Routen-Pruefung)
│   ├── app/                     # Next.js App Router: layout.tsx, providers.tsx, sitemap.ts, page.tsx je Route
│   └── views/                   # Seiten-Komponenten (Client Components), von app/*/page.tsx eingebunden
│       └── legacy/              # Alt-Seiten, nicht geroutet, aus tsconfig/eslint ausgenommen
├── .env.example                 # Env-Var-Vorlage (nie .env committen)
├── tailwind.config.ts
├── tsconfig.json
└── components.json              # shadcn/ui Konfiguration
```

---

## Seiten & Routing

Routing laeuft dateibasiert ueber `src/app/*/page.tsx`. Es gibt **kein** `src/App.tsx`
mehr und keine Baustellen-Weiche: jede Route zeigt das, was in ihrem Ordner liegt.

### Alle Routen (Stand 05.08.2026)

| Route | View | Index | Anmerkung |
|---|---|---|---|
| `/` | `Home.tsx` | ja | Hero (nur die Aussage + CTA), Kunden-Ergebniskarten, Team, Abschluss-CTA. Siehe [Startseite](#startseite-hero-und-team). |
| `/warum` | `Warum.tsx` | ja | Weiche zu den beiden Sales Lettern. Ziel des Navigationspunkts „Warum?“. |
| `/warum-du-mit-ki-kein-geld-verdienst` | `WarumDuKeinGeld.tsx` | **nein** | Sales Letter, noch Platzhaltertext (`isPlaceholder`). |
| `/warum-unternehmen-mit-ki-kein-geld-verdienen` | `WarumUnternehmenKeinGeld.tsx` | **nein** | dito. |
| `/leistungen` | `Leistungen.tsx` | ja | Sechs Schritte + Zielgruppen-Weiche. Inhalt: `src/data/services.ts`. |
| `/solo`, `/enterprise` | `Segment.tsx` über `Solo.tsx`/`Enterprise.tsx` | ja | Eine Vorlage, zwei Zielgruppen. Inhalt: `src/data/segments.ts`. |
| `/referenzen`, `/referenzen/[slug]` | `Referenzen.tsx`, `ReferenzDetail.tsx` | Übersicht ja, Details **nein** | Details auf `noindex`, solange `openPoints` offen sind. |
| `/gratis-wissen`, `/gratis-wissen/[slug]` | `views/wissen/UebersichtSeite.tsx`, `ArtikelSeite.tsx` | ja | Content-Bereich. Inhalt: **eine JSON-Datei je Artikel** unter `content/wissen/`. Steht seit 12.08.2026 in der Kopfzeile an der Stelle von „Warum?". Siehe [Blog-Automatik](#blog-automatik). |
| `/gratis-wissen/thema/[cluster]` | `views/wissen/ThemaSeite.tsx` | ja | Themenseite je Cluster. Entsteht nur, wenn mindestens ein Artikel dazu steht. Inhalt: `content/seo/cluster.json`. |
| `/gratis-wissen/rss.xml` | Route Handler | – | Feed für n8n und als zweiter Sitemap-Kanal. |
| `/autoren`, `/autoren/[slug]` | `views/wissen/AutorSeite.tsx` | ja | Autorenseiten mit `ProfilePage`-Auszeichnung. Inhalt: `content/seo/autoren.json`. |
| `/haltung` | `Haltung.tsx` | ja | Kopf wie ein Hero („Wer KI falsch einsetzt … verbrennt Geld", wörtliche Vorgabe), darunter Werte + Gründerzitat. Inhalt: `src/data/principles.ts`. |
| `/karriere`, `/karriere/[slug]` | `Karriere.tsx`, `KarriereJob.tsx` | **nein** | Stellen sind Platzhalter — siehe [Stellenportal](#stellenportal). |
| `/kontakt` | `Kontakt.tsx` | ja | Kontaktwege, bewusst ohne Formular. |
| `/glossar`, `/glossar/[slug]` | `Glossar.tsx`, `GlossarTerm.tsx` | ja | Sechs Begriffe aus `src/data/glossary.ts`, seit der Migration erstmals wieder erreichbar. |
| `/lass-uns-reden` (`/termin`) | `LassUnsReden.tsx` | ja | Calendly-Inline-Embed, Consent-gated. Ziel aller „Erstgespräch“-CTAs. |
| `/selbstcheck_eu_ai_act` (`/selbstcheck`) | `EuAiActSelbstcheck.tsx` | **nein** | Interaktiver Check, seit 11.08.2026 **markenfrei und von der Website abgekoppelt** — siehe [Markenfreier Selbstcheck](#markenfreier-selbstcheck). Steht in keiner Navigation und in keiner Sitemap. |
| `/impressum`, `/datenschutz`, `/agb` | Rechtstexte | ja | Seit 05.08.2026 in der normalen Shell statt im Alt-Layout. |
| *(alles andere)* | `NichtGefunden.tsx` | – | Echte 404 mit voller Navigation. Vorher zeigte hier die Baustellenseite. |
| `/app/*` | `src/app/app/` | nein | Eingeloggter Bereich (LogTo), über `src/proxy.ts` an `app.kitech-software.de` gebunden. **Noch nicht freigeschaltet** — im Header steht ein Schloss statt eines Login-Links. |

Alte Seiten liegen unter `src/views/legacy/` — nicht geroutet, aus TypeScript- und
ESLint-Pruefung ausgenommen. Dort liegen seit dem 05.08.2026 auch
`UnderConstruction.tsx` und `ComingSoon.tsx`: die Baustellenphase ist vorbei, beide
werden von keiner Route mehr eingebunden.

### Navigation

Struktur in `src/config/navigation.ts` — **die einzige Quelle** für Kopfzeile,
Fußzeile, Sitemap und Routen-Test. Wer eine Seite anlegt, trägt sie dort ein und
ist überall verlinkt.

```
Warum?  ▾  ├─ Warum du mit KI kein Geld verdienst
           └─ Warum Unternehmen mit KI kein Geld verdienen
Leistungen ▾  ├─ Für Selbstständige (/solo)
              └─ Für Unternehmen (/enterprise)
Referenzen · Haltung · Karriere · Kontakt
```

Die beiden Untermenüs klappen auf dem Desktop bei Hover und Tastaturfokus auf
(Escape schließt), auf dem Handy über einen eigenen Chevron-Knopf neben dem Link.
Der Elternpunkt bleibt in beiden Fällen ein echter Link auf eine eigene Seite —
ein Menüpunkt, der nur aufklappt, ist auf dem Handy eine Sackgasse.

Die Fußzeile (`SiteFooter.tsx`) trägt zusätzlich, was in die Kopfzeile nicht
passt: Glossar, Selbstcheck, Terminseite, Rechtstexte, Cookie-Einstellungen.

### Routen-Test

`src/lib/__tests__/routes.test.ts` liest die tatsächlich vorhandenen Routen aus
`src/app/**/page.tsx` (nicht aus einer gepflegten Liste) und prüft:

- jeder interne Link im aktiven Quellcode zeigt auf eine Route oder einen Redirect,
- jeder Navigationspunkt führt auf eine echte Seite,
- **jede öffentliche Route ist von irgendwo aus erreichbar** — genau das war vorher
  bei `/leistungen`, `/haltung`, `/kontakt` und `/glossar` nicht der Fall,
- `siteRoutes` und die echten Routen stimmen überein,
- die Platzhalter-Routen stehen auf `noindex`.

Läuft mit `npm test` mit. `src/views/legacy/` bleibt ausgenommen.

### Stellenportal

`/karriere` und `/karriere/[slug]`, Daten in `src/data/jobs.ts`.

⚠️ **Die vier Stellen sind Platzhalter** (`isPlaceholder: true`), auf Ansage
angelegt, damit das Portal Struktur bekommt. Solange das gilt:

- beide Routen stehen auf `noindex` und nicht in der Sitemap,
- es wird **kein** `JobPosting`-JSON-LD ausgegeben (sonst landen erfundene Stellen
  in Google for Jobs und ziehen echte Bewerbungen).

Beides hängt am Datenzustand, nicht an einem Schalter — echte Stellen eintragen,
und es schaltet sich beim nächsten Build um. Dann zusätzlich in
`src/config/navigation.ts` `indexable: true` setzen, damit `/karriere` auch in die
Sitemap kommt.

Bewerbungen laufen per `mailto:` an `info@kitech-software.de` mit vorbelegtem
Betreff — bewusst keine erfundene `karriere@`-Adresse, die kein Postfach hat.

### Markenfreier Selbstcheck

`/selbstcheck_eu_ai_act` (Kurz-Alias `/selbstcheck`) läuft seit dem 11.08.2026
**ohne Marke und außerhalb der Website** — auf Ansage. Der Check soll als eigenes
Werkzeug gelesen werden, nicht als Unterseite einer Agentur: wer ihn geteilt
bekommt, sieht zuerst die Sache, nicht den Absender.

**Die Seite kommt auf der Website an keiner Stelle mehr vor.** Sie steht in
keiner Navigation (auch nicht in der Fußzeile), in keiner Sitemap, sie steht auf
`noindex, nofollow`, und ihre alte Adresse `/eu-ai-act-selbstcheck` liefert
bewusst eine **404 statt einer Weiterleitung**. Wer die Seite aufruft, hat die
Adresse von woanders. Der Routen-Test nimmt beide Pfade deshalb aus der
Erreichbarkeitsprüfung aus — dieselbe Ausnahme wie `/funnel` und `/fokus`.

| Was | Wo |
|---|---|
| Eigener Rahmen statt `PageShell` | `src/components/layout/CheckShell.tsx` — kein Logo, keine Hauptnavigation, kein Ankündigungsbalken, keine große Fußzeile |
| Verweis oben rechts | Prop `link` der `CheckShell` → `https://www.klargehalt.de/selbstcheck` (Selbstcheck zur Entgelttransparenzrichtlinie), neues Fenster |
| Vorschaubild ohne Logo | `src/components/seo/selbstcheck-og.tsx`, eingebunden über `opengraph-image.tsx` in **beiden** Routenordnern |
| Titel ohne Firmenname | `buildMetadata({ ogImage: null, siteName: null })` in beiden `page.tsx` |

**Warum die Ausnahmen bleiben:**

- **Impressum, Datenschutz, AGB, Cookie-Einstellungen** stehen klein in der
  Fußzeile der `CheckShell`. Die Anbieterkennzeichnung ist nach § 5 DDG Pflicht
  und muss von jeder öffentlichen Seite ohne Umweg erreichbar sein — der
  Firmenname steht dann dort, nicht auf dem Check.
- **Der Ergebnis-CTA** führt weiter intern auf `/lass-uns-reden`, der
  E-Mail-Entwurf geht an `info@kitech-software.de`. Beides trägt auf der Seite
  keinen Markennamen; ohne diesen Weg hätte der Check keinen Zweck.
- **Die Domain** bleibt `kitech-software.de` und steht in Adresszeile, Canonical
  und `og:url`. Markenfrei heißt hier: nichts Sichtbares auf der Seite.

⚠️ Wer hier Logo oder Fußzeile der Hauptseite wieder einbaut, nimmt der Seite
genau die Eigenschaft, für die sie gebaut wurde.

**Umbenennung:** Die Route hieß bis zum 11.08.2026 `/eu-ai-act-selbstcheck` und
war regulär verlinkt und indexiert. Eine 308-Weiterleitung war kurzzeitig
eingebaut und ist auf Ansage wieder entfernt worden — sie wäre genau die Spur in
`next.config.ts`, die es nicht mehr geben soll. Folge: alte Links laufen ins
Leere, und Google fällt die bekannte URL als 404 aus dem Index.

`buildMetadata` hat für diese Seite zwei optionale Felder bekommen
(`ogImage: null`, `siteName: null`); alle anderen Seiten bleiben unverändert.

⚠️ **Offen:** Der Unterstrich-Pfad weicht von der kebab-case-Konvention aller
anderen Routen ab (Vorgabe Ayham). Google behandelt `_` nicht als Worttrenner —
für die Suche ist `selbstcheck_eu_ai_act` ein Wort.

### Blog-Automatik

**Auf Ansage (19.08.2026):** täglich zwei bis drei Artikel unter
`/gratis-wissen`, die ranken und auf den 1:1-KI-Check führen.

Gebaut ist eine Kette unter `scripts/blog-engine/`, die **beim Entwurf
aufhört**. Einrichtung: `deploy/BLOG-ENGINE.md`. Regeln und Bedienung:
`.claude/skills/blog-seo/` (Skill `blog-seo`).

```
npm run blog:brief                  # welche Themen haben belegten Eigenanteil?
npm run blog:brief -- <thema-id>    # Briefing + JSON-Gerüst, ohne bezahlte Abfragen
npm run blog:lauf -- --trocken      # zeigt, was passieren würde. Kostet nichts.
npm run blog:lauf -- --anzahl 2     # zwei Entwürfe
npm run blog:pruefen -- <slug> -v   # Hausstil, 39 harte und 42 weiche Regeln
npm run blog:freigeben -- <slug> --von "Ayham Alkhalil"
npm run blog:indexnow               # nach dem Deploy
npm run blog:backlinks              # Outreach-Ziele, keine Linkerzeugung
```

#### Zwei Wege, und der erste kostet nichts

`npm run blog:brief -- <thema-id>` erzeugt ein vollständiges Redaktionsbriefing
aus dem, was ohnehin im Repo liegt — Eigenanteil aus dem Vorrat, Abgrenzung zu
den Nachbarartikeln, freie Verlinkungsziele samt der schon vergebenen
Ankertexte, Hausstil-Kennzahlen — plus ein JSON-Gerüst mit allen Pflichtfeldern.
Geschrieben wird dann von Hand. **Kosten: null, keine Zugangsdaten nötig.**

Der volle Lauf kostet nachgerechnet **rund 44 Cent je Artikel** (Briefing auf
Sonnet, Schreiben und Nachbessern auf Opus, Einhängen wieder auf Sonnet), dazu
DataForSEO. Er kann dafür etwas, was der Handweg nicht kann: die Ergebnisseite
lesen und vergleichen, was dort schon steht.

⚠️ **DataForSEO gemessen statt geschätzt (24.08.2026):** Ein Lauf im
Trockenmodus über 8 Kandidatenthemen — also **nur Schritt 01**, ohne
SERP-Analyse, ohne Recherche, ohne Schreiben — hat **17,8 Cent** gekostet
(Kontostand 0,8072 → 0,62876 $). Hier stand vorher „etwa 13 Cent je Lauf" für
den *ganzen* Durchgang; das war zu niedrig. Der Betrag entsteht zu etwa gleichen
Teilen aus den drei gebündelten Keyword-Abfragen und den „ähnlichen
Suchanfragen" für die fünf bestbewerteten Themen (Tiefe 2, ~0,02 $ je Thema).
Die SERP-Analyse in Schritt 03 kommt je Artikel dazu.

Die Aufrufe sind bereits gebündelt (drei Anfragen für acht Themen statt
vierundzwanzig) — der Betrag ist nicht durch die Umsetzung verursacht. Wer
sparen will, senkt `VERWANDTE_FUER_TOP` in
[`01-themenfindung.ts`](scripts/blog-engine/schritte/01-themenfindung.ts) oder
die Zahl der bewerteten Kandidaten.

Beide Wege enden beim Entwurf und laufen durch dieselben Tore.

#### Warum die Automatik nicht bis zum Deploy durchläuft

Das ist die wichtigste Entscheidung an diesem Bau, und sie ist keine
Bequemlichkeitsfrage.

Googles Spam-Richtlinie kennt seit 2024 den Tatbestand **„scaled content
abuse"**: viele Seiten, deren Hauptzweck Ranking statt Nutzen ist, ohne
Originalität — *„no matter how it's created"*. Die Bewertungsanleitung für
Googles Prüfer definiert die Gegenprobe als *„the extent to which a human being
actively worked to create satisfying content"* und nennt als Negativbeispiel
ausdrücklich Erzeugung im großen Stil *„without any oversight, manual curation
etc."*.

Der Freigabeschritt **ist** diese Aufsicht. Er steht mit Namen und Datum im
Artikel (`freigabe`). Fällt er weg, fällt das Argument weg, mit dem sich
tägliche Artikel überhaupt verteidigen lassen — und zwar genau in dem Moment,
in dem es gebraucht wird.

Dazu kommt: Die Bewertung findet auf **Website-Ebene** statt („after looking at
several pages on the website"). Es gibt keine Quarantäne für den Blog. Ein
Urteil zieht `/leistungen`, `/referenzen` und die Suche nach dem Firmennamen
mit hinein. Und ein Deploy liefert ohnehin alles aus, was gerade in `main`
liegt — nicht nur Artikel.

Vollständige Risikoeinschätzung mit Quellen und Not-Aus:
`.claude/skills/blog-seo/reference/risiko.md`.

#### Zugangsdaten der Blog-Automatik

**Die Werte gehören in `.env` im Projektwurzelverzeichnis** (Vorlage:
`.env.example`). Die Datei steht in `.gitignore` und wird nie committet.

```
DATAFORSEO_LOGIN=…        # aus dem DataForSEO-Dashboard unter "API Access",
DATAFORSEO_PASSWORD=…     #   NICHT die Anmeldedaten des Benutzerkontos
DATAFORSEO_SANDBOX=1      # zum Ausprobieren: kostenlos, Dummy-Daten
FIRECRAWL_API_KEY=fc-…
ANTHROPIC_API_KEY=…
```

⚠️ **Bis zum 23.08.2026 hätte das nichts genützt: `.env` wurde von keinem
Skript gelesen.** Die Engine fragte `process.env` ab, aber niemand füllte es —
kein `dotenv` im Projekt, kein `--env-file` in den `blog:*`-Scripts, und `tsx`
lädt von sich aus keine `.env`. Nachgemessen: eine Variable eintragen und
auslesen ergab `(nicht gesetzt)`.

Der Fehler war deshalb so heimtückisch, weil er wie ein Zugangsproblem aussieht:
Man trägt den Schlüssel sauber ein und liest trotzdem „DATAFORSEO_LOGIN fehlt".
Und er konnte lange unentdeckt bleiben, weil die Pipeline mangels Schlüsseln
ohnehin nie gelaufen war.

Behoben mit [`scripts/blog-engine/lib/umgebung.ts`](scripts/blog-engine/lib/umgebung.ts):
`process.loadEnvFile()` in einem Modul, das jeder der sechs Einstiegspunkte als
**ersten Import** trägt. Bewusst kein Flag in `package.json` — das griffe nur
beim Start über npm, und die Engine soll auch aus Cron, n8n oder direkt per
`tsx` startbar sein. Fehlt `.env`, passiert nichts: im Container kommen die
Werte aus echten Umgebungsvariablen.

Abgesichert von
[`src/lib/__tests__/blog-engine-umgebung.test.ts`](src/lib/__tests__/blog-engine-umgebung.test.ts)
— der Test prüft für jeden Einstiegspunkt, dass der Import an **erster** Stelle
steht.

**Stand 24.08.2026 — was eingetragen ist:** `DATAFORSEO_LOGIN`,
`DATAFORSEO_PASSWORD`, `FIRECRAWL_API_KEY` und `INDEXNOW_KEY` liegen in `.env`
und sind gegen die jeweilige API geprüft. `ANTHROPIC_API_KEY` **fehlt** — ohne
ihn endet jeder Lauf vor dem Schreiben.

⚠️ **Das DataForSEO-Guthaben ist knapp.** Nach dem ersten echten Lauf standen
noch **0,63 $** auf dem Konto. `DATAFORSEO_TAGESLIMIT_USD` steht deshalb auf
**0,50** statt der voreingestellten 5,00 — die Bremse muss unter dem Guthaben
liegen, sonst greift sie erst, wenn das Konto schon leer ist. Wer auflädt, hebt
den Wert wieder an.

Firecrawl: 4925 von 5000 Credits, Abrechnungszeitraum bis 21.09.2026.

**Erster Lauf, wenn die Schlüssel da sind:**

```bash
npm run blog:lauf -- --trocken     # zeigt, was passieren würde. Kostet nichts.
npm run blog:lauf -- --anzahl 1    # ein Entwurf, danach ansehen
```

#### Das Substanz-Tor

`content/seo/themen-pool.json` ist der Vorrat. Jedes Thema trägt ein Feld
`substanz` — den nicht generierbaren Anteil: eine gemessene Zahl, eine
Konfiguration aus einem echten Projekt, eine Entscheidung mit Begründung, ein
Fehler mit Kosten, eine gelesene Primärquelle, ein zerlegter Ablauf.

**Ein Thema mit `substanz: null` wird nie produziert.** Ist kein Thema mit
Eigenanteil da, erscheint an diesem Tag nichts. Das ist der vorgesehene Zustand,
kein Ausfall — Googles Prüfliste nennt es als Warnsignal, Inhalte nur für den
Anschein von Frische zu veröffentlichen, mit dem Klammerzusatz *„(No, it
won't)"*.

Wer dieses Tor aufweicht, nimmt der Automatik genau die Bremse, wegen der sie
verantwortbar ist. Was als Eigenanteil zählt und was nicht:
`.claude/skills/blog-seo/reference/substanz-gate.md`.

#### Die sechs harten Tore

Jedes bricht Build oder Lauf ab:

1. **Substanz** — ohne belegten Eigenanteil kein Artikel.
2. **Ein Keyword, ein Artikel** — Dubletten brechen den Loader ab.
3. **Keine Zahl ohne Beleg** — jede Fremdzahl braucht `quellen` mit URL und
   Abrufdatum.
4. **Namentlicher Autor** — nie ein Modell. Google rät ausdrücklich davon ab,
   einer KI eine Byline zu geben.
5. **Ankertext im Text** — jeder interne Link braucht seinen Ankertext wörtlich
   im zugewiesenen Absatz. Beim Umstellen der drei Bestandsartikel waren
   fünfzehn von fünfzehn Links eingetragen und **keiner** gerendert; die Prüfung
   sitzt seither im Loader und im Test.
6. **Freigabe** — `status: "veroeffentlicht"` verlangt ein `freigabe`-Objekt.

#### Was bewusst NICHT gebaut ist

| Nicht gebaut | Warum |
|---|---|
| FAQPage-Schema | Google hat das Rich Result zum 07.05.2026 abgeschaltet, die Doku im Juni entfernt. Der sichtbare Frage-Antwort-Block bleibt, das Markup nicht. |
| `keywords`, `wordCount`, `articleSection`, `speakable` im JSON-LD | Schema.org-gültig, kommen in Googles Article-Doku aber nicht vor. Ballast, der so aussieht, als täte er etwas. |
| `priority`, `changefreq` in der Sitemap | *„Google ignores `<priority>` and `<changefreq>` values."* Am 19.08.2026 aus `sitemap.ts` und `navigation.ts` entfernt. |
| Google Indexing API | Ausdrücklich auf `JobPosting` und `BroadcastEvent` beschränkt. Für Blogartikel wäre es Missbrauch und wirkungslos. |
| Ein Vorschaubild je Artikel | `opengraph-image.tsx` unter `[slug]` rendert bei jedem Build ein Bild pro Artikel — der Punkt, an dem ein Build von Minuten auf Stunden kippt. |
| Automatischer Linkaufbau | Die Link-Spam-Richtlinie verbietet wörtlich *„Using automated programs or services to create links to your site"*. `backlink-radar.ts` findet Gelegenheiten für Ansprache durch Menschen. |
| Eine zweite Domain für mehr Volumen | Wörtlich ein Richtlinienbeispiel (*„Creating multiple sites with the intent of hiding the scaled nature of the content"*) und zusätzlich als Umgehung behandelt. |

#### Aufbau

| Was | Wo |
|---|---|
| Datenmodell (Zod), Qualitätstor | `src/lib/wissen/schema.ts` |
| Laden mit Prüfung — bricht den Build ab | `src/lib/wissen/laden.ts` |
| JSON-LD (BlogPosting, ProfilePage, CollectionPage) | `src/lib/wissen/schema-org.ts` |
| Interne Links in den Fließtext setzen | `src/lib/wissen/verlinken.tsx` |
| Darstellung — **Server Components** | `src/views/wissen/` |
| Artikel, Autoren, Themen, Vorrat, Protokolle | `content/wissen/`, `content/seo/` |
| API-Zugänge mit Kostenbremse | `scripts/blog-engine/lib/{dataforseo,firecrawl,claude}.ts` |
| Hausstilprüfung, 81 Regeln | `scripts/blog-engine/lib/qualitaet.ts` |
| Die neun Schritte | `scripts/blog-engine/schritte/` |
| Prüfungen im Testlauf | `src/lib/__tests__/wissen.test.ts` |

⚠️ **`generateStaticParams` rendert derzeit alle Artikel vor.** Das ist richtig,
solange sie als Dateien im Repo liegen. Ab etwa 500 Artikeln wird der Build
spürbar länger — dann auf die neuesten 200 plus `dynamicParams: true` umstellen.
Die Anleitung dafür steht im Kopf von
`src/app/gratis-wissen/[slug]/page.tsx`. Bei drei Artikeln täglich ist die Marke
in gut fünf Monaten erreicht.

### Kampagnenseiten `/funnel` und `/fokus`

Zwei eigene Domains, ein Repo: `funnel.kitech-software.de` und
`fokus.kitech-software.de` werden in `src/proxy.ts` auf die internen Segmente
`/funnel` und `/fokus` umgeschrieben (Rewrite, kein Redirect — die Adresszeile
bleibt stehen). Beide stehen auf `noindex`, in keiner Navigation und in keiner
Sitemap; der Routen-Test nimmt sie von der Erreichbarkeitsprüfung aus.

#### Funnel-Grundsatz

**Ansage 19.08.2026:** Bei Funnels geht es nicht um die normale Webseite,
sondern um Kampagnen, die einen klaren, tiefen Einblick in KITechs
Loesungsarbeit geben. Klassische Funnel-Geschenke wie PDFs, oberflaechliche
Checklisten oder generische "3 Tipps" sind ausgelaugt und sollen nicht der Kern
des Angebots sein.

Der Lead-Magnet eines Funnels soll bevorzugt ein **Video oder eine kleine
Video-Strecke** sein, in der Ayham/KITech ein echtes Problem sichtbar loest:
"Das ist das Problem, das ist das Thema, und so gehen wir direkt in die
Loesung." Der Wert muss im Funnel selbst liegen, nicht erst hinter einem Call.
Geeignet sind tiefe Denkmodelle, Architekturentscheidungen, Prozesszerlegungen,
Automatisierungen, echte Projektlogik, interne Methoden oder ein sauber
aufbereiteter Einblick in ein aufwendiges Projekt.

**Wichtig fuer neue Funnel-Konzepte:** lieber ein konkretes Problem radikal gut
loesen als breit erklaeren. Ein Funnel soll das Gefuehl ausloesen: "Wenn sie
das kostenlos so tief zeigen, will ich wissen, was sie im Projekt koennen."
PDFs duerfen hoechstens begleitend als Mitschrift, Spickzettel oder technische
Zusammenfassung dienen — nie als Hauptversprechen.

Dabei keine vertraulichen Kundendaten, Secrets, Zugangsdaten oder
vertraglich geschuetzten Details veroeffentlichen. "Tiefe Geheimnisse" meint:
ungewoehnlich wertvolles Know-how und echte Loesungstiefe, die von Ayham fuer
den Funnel freigegeben wurde.

**Wo dieser Grundsatz beim Bauen greift:** ausformuliert als
[`.claude/skills/funnel-narrativ/reference/substanz.md`](.claude/skills/funnel-narrativ/reference/substanz.md).
Der `funnel-narrativ`-Skill liest die Datei seit dem 19.08.2026 als **Schritt 0**
— noch vor Sprachregeln und Schemawahl. Damit ist die Frage „was bietet der
Funnel ueberhaupt an?" nicht mehr eine unter vielen, sondern die erste. Dort
stehen auch die Punkte, die dieser Abschnitt nur streift: die Match-and-refuse-
Liste (PDF, Checkliste, "X Tipps", Audit als Koeder), das Prinzip fuer die Grenze
nach unten (**verschenkt wird das Wissen, nicht die Ausfuehrung**), und was vor
einer Aufnahme aus einem Kundenprojekt zu klaeren ist — Testdaten statt echter
Datensaetze, schriftliche Freigabe des Kunden, im Zweifel anwaltlich pruefen
lassen.

⚠️ **Der aktuelle `/funnel` erfuellt den Grundsatz noch nicht.** Er bewirbt einen
Live-Workshop — der Einblick entsteht also erst *nach* der Anmeldung. Als Beweis
davor stehen nur Kennzahlen und zwei Zitate. Solange kein Video davorsteht, in
dem tatsaechlich etwas geloest wird, verlangt die Seite Vertrauensvorschuss ohne
Gegenleistung. Was dafuer fehlt, steht im Kopfkommentar von
`src/data/funnel.ts`.

**`/funnel` bewirbt seit dem 12.08.2026 einen kostenlosen Live-Workshop**
(vorher: allgemeine Seite über KI-Infrastruktur). Aufhänger ist die Umkehrung —
nicht „wie du mit KI mehr Umsatz machst", sondern *warum du es bisher nicht
tust*. Zielgruppe sind Geschäftsführer und Entscheider im Mittelstand.

Die **Sektionsreihenfolge stammt aus einer Vorlage**, die Ayham vorgegeben hat
(`src/assets/funnels.leadersmedia.de_scale_ (1).png`): Hero mit Termin → Beweis
→ Problem → CTA → Mechanismus → Wiedererkennung → Vorher/Nachher → Ergebnisse →
Qualifizierung → CTA → Gründer → FAQ → Abschluss-CTA. Übernommen wurde die
*Struktur*, nicht das Aussehen — Farben, Typografie und Knöpfe kommen aus dem
Designsystem dieser Website. Erzählerisch bleibt es Schema A des
`funnel-narrativ`-Skills.

Drei Eigenheiten sind Absicht: **derselbe CTA an vier Stellen** (wer irgendwo
überzeugt ist, klickt dort), **Chevrons statt Trennlinien** zwischen den
Blöcken, und **Beweis in zwei Formen** — kurze Kundenstimmen früh, Kennzahlen
erst nach dem Problem.

Nicht übernommen wurde alles, was die Vorlage an Beweis behauptet, ohne dass es
hier belegbar wäre: zehn Testimonials mit Zahlen (wir haben zwei abgegebene
Zitate), eine Sammelbewertung und ein durchgestrichener Vorher-Preis.

| Was | Wo |
|---|---|
| Rahmen ohne Ausgänge | `src/components/layout/FunnelShell.tsx` — **keine Kopfleiste**, nur Rechtstexte unten. **Nicht `PageShell`**: volle Navigation gibt kaltem Traffic ein Dutzend Ausgänge vor dem einen Knopf. |
| Logo | `FunnelLogo` aus derselben Datei — steht *in* der ersten Sektion der Seite, auf deren Grund, damit keine Leiste entsteht. Dunkle Datei `public/logo.png`; `logo-weiss.svg` wäre auf hellem Grund unsichtbar. Bewusst ohne Link. |
| Besuchsmeldung | `src/app/api/funnel-besuch/route.ts` + `src/lib/funnel-besuch.ts` — meldet **jeden** Aufruf an `FUNNEL_BESUCH_WEBHOOK_URL`, unabhängig vom Cookie-Banner. Ohne Cookie, ohne IP-Weitergabe, ohne Drittdienst; deshalb einwilligungsfrei. Ohne gesetzte Variable passiert nichts. |
| Inhalt | `src/data/funnel.ts` |
| Termin + Countdown | `src/components/sections/WorkshopTermin.tsx` — rendert **nur mit echtem Datum**. `termin: null` ⇒ der ganze Block entfällt. |

⚠️ **Drei offene Punkte, solange sie stehen bleibt `noindex`:** es ist kein
Termin eingetragen, `patternInterrupt.body` ist Platzhaltertext, und der CTA
führt auf `/lass-uns-reden` (Kalender der KI-Bewertung) statt auf eine
Workshop-Anmeldung. Details stehen im Kopfkommentar von `src/data/funnel.ts`.

**`/fokus` ist auf Ansage leer** (12.08.2026). Dort stand ein 1:1-Workshop für
299 € — ein Preis aus dem Vite-Vorgänger, der so nicht mehr gilt. Die Route
bleibt bestehen statt zu verschwinden, weil die Domain eingerichtet und
möglicherweise geteilt ist; eine 404 auf einer beworbenen Adresse ist schlechter
als eine Seite, die sagt, dass gerade nichts da ist. Der alte Inhalt liegt
vollständig im Commit `176b6a2` (`git checkout 176b6a2 -- src/data/fokus.ts
src/views/Fokus.tsx`).

### Entfernt am 05.08.2026: Community und Mitgliederbereich

**Auf Ansage komplett von der Website genommen** — die Skool-Community war noch
nicht startklar, und ein angekuendigter Mitgliederbereich ohne Termin ist ein
Versprechen, das niemand einloest.

| Weg | Was es war |
|---|---|
| `/community` (Route, View, Countdown, Warteliste) | Einstieg in die Skool-Gruppe, zuletzt hinter Milchglas |
| `/api/warteliste` + `WAITLIST_WEBHOOK_URL` | Anmeldungen an einen n8n-Webhook |
| `public/media/ayham-community.webp`, `skool-og.jpg` | freigestelltes Foto, Social-Vorschaubild |
| `company.skoolUrl` | die Gruppen-Adresse |
| Schloss "Mitgliederbereich – bald" in `SiteHeader.tsx` und `Header.tsx` | Ankuendigung des eingeloggten Bereichs |

**Der Code ist nicht verloren:** vollstaendig im Commit **`31a655b`**
("Community-Seite hinter Milchglas, solange sie im Aufbau ist"). Zurueckholen:

```bash
git checkout 31a655b -- src/views/Community.tsx src/app/community \
  src/components/sections/CommunityCountdown.tsx \
  src/components/sections/CommunityWarteliste.tsx \
  src/app/api/warteliste public/media
```

Danach wieder eintragen: `src/config/navigation.ts` (Kopfzeile, Fußzeile,
`siteRoutes`), `company.skoolUrl`, `WAITLIST_WEBHOOK_URL` in `.env.example`,
und den Redirect in `next.config.ts` zuruecknehmen.

**Nicht angefasst:** der eingeloggte Bereich selbst (`src/app/app/`,
`src/components/app/`, `src/proxy.ts`, LogTo). Er ist weiterhin da und ueber
`app.kitech-software.de` erreichbar, sobald LogTo ein Zertifikat hat — er wird
auf der oeffentlichen Seite nur nicht mehr angekuendigt.

`/community` und `/skool` leiten beide per 308 auf die Startseite: beide Adressen
standen in der Navigation und wurden geteilt.

### Startseite: Hero und Team

**Der Hero traegt genau eine Aussage** — „Falsche KI kostet **mehr** als keine KI."
(weisser Marker auf „mehr") plus den Erstgespraech-CTA. Sonst nichts. Am
05.08.2026 sind auf Ansage entfallen: das Label „Für den deutschen Mittelstand",
der Positionierungsabsatz, die Medienflaeche (`HeroMedia.tsx` ist dadurch
ungenutzt, die Datei liegt noch da) und die beiden Kacheln „50+ Projekte" /
„98 % Kundenzufriedenheit". Begruendung: die Aussage soll allein wirken. Wer
eines davon zurueckholt, nimmt ihr genau diese Wirkung.

**Team** (`TeamSection.tsx`, Daten in `src/data/team.ts`): vier gleich breite
Kacheln, je Name, Rolle, ein Satz und LinkedIn. Die Saetze und Rollen sind
woertliche Vorgaben von Ayham — nicht umformulieren. Fehlt ein Foto (Joerg,
Jennifer), zeigt die Kachel eine neutrale Silhouette statt einer leeren Flaeche.
`linkedinUrl` ist bisher nur bei Ayham gefuellt; ohne URL rendert die Kachel
keinen Link, statt auf ein fremdes Profil zu zeigen.

### Popup auf der Startseite

`src/components/conversion/CallPopup.tsx`, Inhalt und Zeiten in
`src/data/call-popup.ts`. **Auf Ansage (13.08.2026):** „Fast ganz ungescrollt
kommt sofort ein Pop-up: ‚Buch dir einen Call‘, so richtig direkt … so ganz
radikal, so richtig stoppend."

- **Nur die Startseite.** Hängt in `Home.tsx`, nicht in `PageShell` — auf
  `/lass-uns-reden` wäre es sinnlos, über einem Rechtstext unpassend.
- **Wann es aufgeht (geändert am 14.08.2026):** frühestens nach **25 s** auf der
  Seite, und dann erst, wenn **6 s lang nichts passiert** — kein Scrollen, keine
  Taste, kein Klick, kein Wischen. Spätestens nach 75 s kommt es auch bei
  Dauerbetrieb. Erstbesucher sehen es erst, wenn der **Cookie-Banner
  entschieden** ist (Event `CONSENT_DECIDED_EVENT` aus `src/lib/consent.ts`,
  gefeuert in `CookieConsent.tsx`) — sonst läge ein Dialog über der
  Einwilligung und machte sie unbedienbar; danach kommen 2 s Vorlauf dazu.
  Wer den Banner gar nicht anfasst, sieht kein Popup.

  Ursprünglich (13.08.2026) ging es 3,5 s nach dem Laden auf, oder sofort ab
  120 px Scroll. Das ist auf Ansage zurückgenommen: „Bitte ein bisschen
  verzögert anzeigen — es soll kommen, wenn quasi nichts passiert. Ranking ist
  schon sehr wichtig."
- **Wie oft:** einmal, dann 7 Tage Ruhe (weggeklickt) bzw. 90 Tage (Knopf
  geklickt). Zeitstempel im `localStorage` unter `call-popup-v1`.
- **Aufbau:** Radix-Dialog aus `components/ui/dialog` — Escape, Fokus-Falle und
  Scroll-Sperre kommen von dort. Der Fokus geht auf den Kasten, nicht auf das
  Schließen-Kreuz. Scharfe Kanten, Pill-Knopf mit denselben Maßen wie im Hero.

**Warum die Wartezeit:** Google wertet Overlays, die auf dem Handy unmittelbar
nach dem Laden den Inhalt verdecken, als „intrusive interstitial" und kann die
Seite in der mobilen Suche zurückstufen — und die Startseite ist die Seite, die
ranken soll. Mit der Verzögerung fällt das Popup nicht mehr darunter. Wer an
der Taktung dreht, ändert `CALL_POPUP_MINDESTDAUER_MS`, `CALL_POPUP_RUHE_MS`
oder `CALL_POPUP_SPAETESTENS_MS` — die Komponente muss dafür nicht angefasst
werden. **Je kürzer die Mindestdauer, desto größer das Ranking-Risiko.**

### Kundenkarten: Ergebnis, Beleglinks, Fotos, Sterne

Alles dazu steht in `src/data/client-results.ts`, gerendert von `ClientResults.tsx`
(Startseite), `ReferenceCard.tsx` (Uebersicht) und `ReferenzDetail.tsx`.

**Die Karte fuehrt mit dem Ergebnis.** Kennzahl gross, darunter eine
Akzent-Unterstreichung, dann Label, ein Satz, die Belegzeilen und der Live-Link.
Am 05.08.2026 war sie kurzzeitig auf Foto, Name, Zitat und Sterne reduziert —
ohne jede Zahl. Das ist auf Ansage zurueckgenommen worden ("ganz prominent die
Ergebnisse zeigen"). Wer sie erneut entkernt, nimmt der Startseite ihren
einzigen harten Beweis.

- **Wohin ein Klick fuehrt** (`klickZiel`, seit 17.08.2026): normalerweise auf
  die Detailseite `/referenzen/<slug>`. Mit `klickZiel: "live"` fuehrt die ganze
  Karte stattdessen auf `liveUrl`, in einem neuen Tab — die Pille heisst dann
  „<adresse> oeffnen" statt „Fall ansehen". Gilt fuer **klargehalt.de** (Ansage
  17.08.2026): der Fall hat keine Person, kein Zitat und keine Bewertung, sein
  einziger Beleg ist das Produkt. Die Entscheidung steht in den Daten und gilt
  damit gleichzeitig fuer das Laufband (`KundenLaufband.tsx`) und die Uebersicht
  (`ReferenceCard.tsx`) — beide lesen `kartenLink()`. Ohne `liveUrl` faellt es
  still auf die Detailseite zurueck. Die Detailseite bleibt unter ihrer Adresse
  erreichbar, sie wird nur nicht mehr verlinkt.
- **Beleglinks** (seit 05.08.2026): `liveUrl` zeigt auf das tatsaechlich gebaute
  Produkt und wird als eigener "Live im Einsatz"-Block gerendert — ccp-portal.de
  (cert consulting Pane), dashboard.niimmo.de (NiImmo), klargehalt.de. `companyUrl`
  ist die Website des Kunden (pflegexperts.de, niimmo.de) und steht klein in der
  Fusszeile der Karte. Beide Felder nur mit gepruefter Adresse fuellen; die
  Unterscheidung ist wichtig, weil "hier laeuft es" mehr belegt als "den Kunden
  gibt es". Fuer Nereo und die Lead-Pipeline existiert keine oeffentliche Adresse.
- **Kartentexte** sind am 05.08.2026 neu geschrieben und gegen die Belegbasis
  faktengeprueft worden. `label` und `summary` duerfen `duration`, `before`/`after`
  und `review` **nicht wiederholen** — die rendert die Karte bereits als eigene
  Zeilen. Formulierungen wie "Vollzeitstellen weniger Verwaltungsarbeit" sind
  ausdruecklich raus: belegt ist eine Aufwands-Aequivalenz, kein Dauerzustand.
- **Sterne pro Kunde** (`rating`, seit 05.08.2026 ueberall 5, vorher 4). Ersetzt
  seit 04.08.2026 die Sammelzeile "5 Sterne · 40+ Bewertungen" im Hero — die ist
  samt `HeroReviews.tsx` und `reviewCountLabel` entfallen.
  ⚠️ **Offen:** Die Zahl wird einer namentlich genannten Person zugeschrieben,
  schriftlich belegt sind aber nur Dennis Mikyas und Eugen Kretschmann. Fuer die
  uebrigen fuenf Kunden fehlt eine dokumentierte Bewertung — erfundene
  Bewertungen sind nach Anhang zu § 3 Abs. 3 Nr. 23c UWG abmahnbar.
- **`review`** ist der kurze Bewertungssatz auf der Karte. Nur befuellen, wo der
  Satz woertlich so abgegeben wurde; aktuell nur bei Dennis Mikyas. Eugen
  Kretschmann (KREMA) hat ein belegtes Zitat in `src/data/testimonials.ts`, aber
  keinen Karteneintrag — dafuer fehlen Firma und Projektangaben.
- **Portraits** liegen als freigestellte WebPs (transparent, auf die Person
  zugeschnitten, 520 px hoch) unter `public/images/kunden/`. Quelle waren SVG-
  Freisteller von Ayham; als SVG waren sie 3,9 MB, als WebP sind es 84 KB.
  `ReferencePortrait.tsx` haengt allen die Utility `.portrait-fade` (`src/index.css`)
  an: die Fotos enden am Brustkorb, ohne den Verlauf sieht die Person abgeschnitten
  aus. Die `imageClassName`-Hoehe muss zur Breite passen, sonst entsteht Leerraum.
- **Reihenfolge im Raster** = Array-Reihenfolge. Oben stehen die Faelle, fuer die
  ein Foto vorliegt.
- **Offen — Grynia:** `public/images/kunden/grynia.webp` liegt bereit, es fehlen
  Name, Firma und die Kennzahl. Kommt der Fall dazu, muessen "Sechs von ueber 50"
  in `ClientResults.tsx` und "Sechs Faelle …" in `Referenzen.tsx` mitgezogen werden.

---

## Wichtige Konventionen

- **Path Alias:** `@/` → `src/` (konfiguriert in `tsconfig.json`; fuer die Tests zusaetzlich in `vitest.config.ts`)
- **TypeScript Strict Mode ist deaktiviert** (`noImplicitAny: false`, `strictNullChecks: false`)
- **shadcn/ui Komponenten** liegen in `src/components/ui/` — bei neuen Komponenten `npx shadcn@latest add <component>` verwenden, nicht manuell hinzufügen
- **Design-System:** CSS Variables (HSL-basiert) in `src/index.css`, konfiguriert in `tailwind.config.ts`
- **Custom Tailwind Utilities:** `.gradient-text` (nur in Alt-Seiten wie Referenzen/Leistungen/Haltung/Kontakt, in neuen Komponenten bewusst vermieden), `.gradient-cta`, `.shadow-soft`, `.shadow-card`, `.shadow-elevated`, `.animate-marquee`, `box-decoration-clone` (Tailwind-Core-Utility, fuer Highlight-Boxen hinter mehrzeiligem Text)
- **Schriftart:** Onest (`@fontsource/onest`)
- **Eckige statt runde Flaechen:** Neu gebaute Komponenten verwenden bewusst **keine** `rounded-*`-Klassen — scharfkantige, klar umrandete Boxen statt runder Pill-Badges. Nur noch `CookieConsent` und die shadcn-Bausteine nutzen `rounded-*`. Bei neuen Komponenten im Zweifel scharfkantig bauen.
- **CTA-Konvention:** Jeder "Erstgespraech buchen"/Calendly-Button im gesamten Repo navigiert intern zu `/lass-uns-reden` (per `<Link>`/`useNavigate`), **niemals** mehr `window.open()` zu einer externen Calendly-URL. Die einzige verbleibende externe Calendly-URL ist die `data-url` im Embed selbst (`LassUnsReden.tsx`).

### Eine neue Seite bauen

Reihenfolge, damit nichts vergessen wird (der Routen-Test meckert sonst):

1. **Inhalt** nach `src/data/<thema>.ts` — nicht in die Komponente. Texte kommen
   von Ayham und werden dort ersetzt, ohne die Darstellung anzufassen.
2. **View** nach `src/views/<Name>.tsx`, aufgebaut mit `PageShell` +
   `SITE_CONTAINER` (bzw. `TEXT_CONTAINER` bei Fließtext) + `PageHeading` +
   `CtaBanner`.
3. **Route** als dünner Server-Wrapper `src/app/<pfad>/page.tsx` mit
   `export const metadata = buildMetadata({...})`.
4. **Eintragen** in `src/config/navigation.ts` — sowohl in eine Navigation
   (`mainNavigation` oder `footerNavigation`) als auch in `siteRoutes`.
5. `npm test` — der Routen-Test prüft, dass die Seite existiert, erreichbar ist
   und ihr Indexierungs-Status zur Sitemap passt.

**Was nicht gebaut wird** (Vorgabe Ayham): das Muster *kleines Rechteck-Label →
Überschrift → Erklärabsatz*, und Raster aus gleich großen Karten mit Icon im
abgerundeten Quadrat. Beides liest sich als Baukasten. Stattdessen: Aussage als
Überschrift, höchstens ein Satz darunter, Listen mit Trennlinien statt Kacheln
(`divide-y`) oder Raster über `gap-px` auf `bg-border`.

---

## Design System

### Farbschema (HSL-basiert, CSS Custom Properties)

**Aktuell dark-first ("KI-Redesign v2"):** `:root` und `.dark` sind beide near-black und liegen nur wenige Prozentpunkte auseinander — es gibt kein klassisches helles Light-Mode mehr, obwohl `next-themes` in `src/app/providers.tsx` noch mit `defaultTheme="light"` konfiguriert ist und der Theme-Toggle im Alt-Header weiterhin funktioniert.

**`:root` (Default):**
- `--background`: 0 0% 6% (fast Schwarz)
- `--foreground`: 0 0% 97%
- `--primary`: 245 85% 62% (gesaettigtes Blau/Violett)
- `--accent`: 85 70% 55% (Signal-Lime)
- `--border`: 0 0% 18%

**`.dark` (Theme-Toggle):**
- `--background`: 0 0% 5%
- `--foreground`: 0 0% 98%
- `--primary`: 245 88% 64%
- `--accent`: 85 72% 57%

- `--solo-accent` (Amber, warm) / `--enterprise-accent` (Lime, kuehl) fuer den Solo-vs-Enterprise-Funnel.
- `.gradient-text` ist laut Kommentar in `index.css` **nur fuer Alt-Seiten** gedacht (Referenzen/Leistungen/Haltung/Kontakt) - in neu gebauten Komponenten bewusst vermieden (rein dekorativ, nicht bedeutungstragend).

### Typografie
- **Body-Font:** Onest (Gewichte 100–700), `font-thin` als Default
- **Display-Font:** "Recursive Variable" (`kinetic-display`) fuer alle Headlines, `kinetic-data` fuer Zahlen und Kurzlabels - animiert zwischen serifenlos/mono-Achsen. Seit dem 05.08.2026 durchgaengig, auch auf Rechtstexten und Glossarartikeln.
- `kinetic-morph-in` nur auf der **H1** einer Seite, nicht auf jeder Ueberschrift - sonst zappelt beim Laden die ganze Seite.

### Custom Button-Varianten (`src/components/ui/button.tsx`)
- `hero` / `cta`: gefuellter Primary-Button mit Shadow
- `heroOutline` / `ctaOutline`: Outline-Varianten
- Alle Varianten nutzen `rounded-lg` als Basis — neuere Komponenten ueberschreiben das haeufig mit eigenen, eckigen Containern statt den Button direkt zu stylen.

### Knoepfe ohne feste Hoehe

**Regel (17.08.2026): `min-h-[…] py-…` statt `h-[…]`.** Die Beschriftung jedes
Termin-Knopfes kommt aus `src/config/angebot.ts` und aendert sich mit dem
Angebot. Solange dort „Kostenloses Erstgespraech" stand, passte alles in 56 px;
mit „Kostenlosen 1:1-KI-Check sichern" brach der Text zweizeilig um und lief
oben und unten aus der Pille heraus — der Knopf sah kaputt aus (gemeldet von
Ayham mit Screenshot).

Betroffen waren `CtaBanner.tsx` (Abschluss-CTA auf Referenzen, Leistungen,
Haltung, Glossar, Warum, Wissen), der Hero-Knopf in `Home.tsx` und der Knopf im
Seitenkopf von `Segment.tsx` (`/solo`, `/enterprise`). Alle drei stehen jetzt
auf `min-h` mit eigener Innenhoehe.

Im selben Zug traegt die Pille im `CtaBanner` die **kurze** Verfuegbarkeitszeile
(`verfuegbarkeitKurz()`, „Donnerstags — noch 2 von 5 Plaetzen"). Die lange
Fassung braucht in einer 360-px-Pille drei Zeilen; sie steht weiter dort, wo
eine ganze Zeile Platz ist — Ankuendigungsbalken und `/lass-uns-reden`. Die
Zahlen sind in beiden Fassungen dieselben.

Geprueft wird das nicht automatisch: wer eine Beschriftung verlaengert, sieht
sie sich bei **360 px** Fensterbreite an. Dort bricht zuerst etwas um.

### Cookie-Banner bricht erst ab `dt` um

**Regel (23.08.2026): Wer eine Zeile aus Text plus mehreren Knoepfen baut,
misst sie bei 768 px.** Dort ist sie am engsten — `md` hat gerade gegriffen, der
Platz aber noch nicht.

Der Cookie-Banner stand auf `md:flex-row` (768 px): Icon (56 px) + Text + drei
Knoepfe mit `whitespace-nowrap` in einer Zeile. Gemessen auf der Live-Domain
ragte die Knopfgruppe **31 px ueber den rechten Bildschirmrand**, bei 800 px
stand sie auf der Kante (−1 px), erst ab 840 px war Luft. Betroffen war **jede
Seite** — und 768 px ist das iPad im Hochformat.

Zwei Ursachen, beide behoben:

| Was | Warum |
|---|---|
| `md:flex-row` → `dt:flex-row` | `dt` (1025 px) ist der Punkt, an dem auch die Kopfzeile umschaltet und seit dem 22.08.2026 das Hero-Portrait erscheint. Bis dahin steht der Banner zweizeilig — was er soll. |
| `flex-1` → `flex-1 min-w-0` | Ein Flex-Kind kann per Vorgabe **nicht** unter seine Inhaltsbreite schrumpfen (`min-width: auto`). Ohne `min-w-0` drueckt der Text die Knoepfe hinaus, statt selbst nachzugeben. Das ist die eigentliche Ursache — der Breakpoint allein hätte den Fehler nur verschoben. |

Mitgezogen: `hidden md:block` am Icon (sonst stuende es zwischen 768 und 1024 px
allein ueber dem Text) und `w-full md:w-auto` an der Knopfgruppe.

Nachgemessen im Container: bei 768 px jetzt **57 px Luft** statt 31 px
Ueberstand, ueber alle Breiten von 700 bis 1100 px kein Ueberstand mehr.

### Container

Eine Breite fuer alles: **`SITE_CONTAINER`** aus
`src/components/layout/site-container.ts` — `max-w-[1180px]`, zentriert,
`px-5 sm:px-8`.

Vorher trug jede Seite ihren eigenen Wert (Startseite 1060 px, Community 1120 px,
Referenzen 1180 px, Selbstcheck den 1280er `container`); beim Wechsel zwischen
zwei Seiten sprang dadurch das Logo sichtbar hin und her. Auch Sektionen
ausserhalb der Shell (`ClientResults`, `CtaBanner`) nutzen die Konstante, damit
sie mit Kopf- und Fusszeile fluchten.

**`TEXT_CONTAINER`** (`max-w-[760px]`) fuer zusammenhaengenden Fliesstext —
Rechtstexte, Glossarartikel. 1180 px waeren fuer einen Datenschutztext unlesbar.

Die Tailwind-`container`-Klasse (1280 px) stammt aus dem Alt-Layout und wird in
neu gebauten Seiten nicht mehr verwendet.

### Hintergrund

`SignalBackdrop` (Verlauf + Canvas-Signalfeld + Auslauf) statt vier Kopien
desselben Verlaufswerts. Ueber `PageShell` gesteuert:

| Prop | Wirkung |
|---|---|
| `backdrop="header"` (Standard) | eingefaerbter Kopfbereich, 620 px, laeuft nach unten aus |
| `backdrop="full"` | ganze Flaeche (404) |
| `backdrop="none"` | ohne eigenen Grund, fuer Seiten mit eigenem Hintergrund |
| `backdropClassName` | eigene Hoehe, z. B. bildschirmhoch auf der Startseite |

---

## SEO-Architektur

### Meta-Tags (serverseitig gerendert)
- `buildMetadata()` in `src/lib/metadata.ts` erzeugt pro Seite Title, Description, OpenGraph, Twitter Cards, Canonical und optional `noindex`. Wird in `src/app/*/page.tsx` als `export const metadata` genutzt. Die frühere `SEOHead`-Komponente (useEffect-basiert) ist damit abgelöst.
- **Sitemap wird generiert** (`src/app/sitemap.ts`) und pflegt seit dem 05.08.2026 **keine eigene Pfadliste mehr**: die statischen Routen kommen aus `siteRoutes` (`src/config/navigation.ts`), Referenz- und Glossar-Detailseiten direkt aus den Datendateien. Ausgeschlossen werden automatisch alles mit `indexable: false` und die Alias-Routen (`/termin`, `/selbstcheck`), deren Canonical woanders hinzeigt.
  Vorher standen Navigation und Sitemap als zwei getrennte Listen nebeneinander und waren auseinandergelaufen — `/leistungen`, `/haltung`, `/kontakt` und `/glossar` fehlten in der Sitemap, obwohl es sie gab.
- Base URL: `https://kitech-software.de`
- Locale: `de_DE`

### Structured Data (JSON-LD)
`src/components/seo/StructuredData.tsx` — Schema-Funktionen fuer Organization, LocalBusiness, WebPage, Breadcrumb, Review, FAQ, Person (Gruender), ItemList (Kunden), Enterprise-Cloud-spezifische Schemas. Bei Content-Aenderungen diese Datei ggf. mitpflegen. Zod-Validierung der erzeugten Schemas in `src/lib/schema-validators.ts` + `src/lib/__tests__/`.

### JSON-LD des ausgelieferten HTML prüfen

```bash
npm run pruefe:jsonld                            # gegen die Live-Domain
node scripts/pruefe-jsonld.mjs http://127.0.0.1:8124   # gegen den Container
```

[`scripts/pruefe-jsonld.mjs`](scripts/pruefe-jsonld.mjs) holt 19 Seiten, liest
jeden `application/ld+json`-Block und prüft drei Dinge: gültiges JSON mit
`@context`, kein Typ doppelt, der nur einmal vorkommen darf (`BreadcrumbList`,
`Organization`, `WebSite`, `WebPage`, `ProfilePage`, `CollectionPage`), und
jede `@id`-Referenz (`publisher`, `worksFor`, `isPartOf`, `about`) zeigt auf
einen Knoten, der auf derselben Seite auch definiert ist.

**Warum als Skript und nicht als Unit-Test.** Die Schemas entstehen an drei
Orten: in `StructuredData`-Aufrufen der Views, in Sammelfunktionen wie
`buildGlossaryIndexSchema()`, und in `PageShell` (Organisation + WebSite). Was
am Ende auf einer Seite steht, sieht man erst am gerenderten HTML — die
Breadcrumb-Dublette auf `/glossar` war im Quelltext unsichtbar.

Was sich statisch prüfen lässt, steht trotzdem im Testlauf:
[`breadcrumb-dubletten.test.ts`](src/lib/__tests__/breadcrumb-dubletten.test.ts)
prüft die Schema-Funktionen auf genau eine Breadcrumb, die einheitliche
Beschriftung „Startseite" (der Rest der Website nutzt sie 34-mal, das Glossar
war der Ausreißer) und — statisch über alle Views — dass keine View eine
Sammelfunktion mit einem eigenen `getBreadcrumbSchema()` kombiniert.

⚠️ Beide Tests prüfen **Quelltext**. Sie schneiden Kommentare heraus
([`quelltext.ts`](src/lib/__tests__/quelltext.ts)) — sonst verbietet der Test
genau die Dokumentation, wegen der er existiert. Dieselbe Falle war vorher beim
`§ 5 TMG`-Test zugeschnappt.

### KI-Crawler-Optimierung
- `robots.txt`: Explizite Allow-Regeln fuer GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot
- `llms.txt` / `llms-full.txt`: Kompakte bzw. ausfuehrliche Projektuebersicht fuer KI-Agenten — **werden seit dem 21.08.2026 erzeugt, nicht gepflegt** (`npm run llms`, siehe [llms.txt](#llmstxt-wird-erzeugt-nicht-gepflegt)). Ein Test bricht ab, sobald sie vom Stand der Datendateien abweichen.
- `sitemap.xml`: enthaelt aktuell 19 URLs — alle Hauptseiten, die Rechtstexte und die sechs Glossarartikel. Nicht enthalten: die beiden Sales Letter und `/karriere` (Platzhalterinhalte), die Referenz-Detailseiten (offene Punkte), die Kampagnenseiten `/funnel` und `/fokus`, der Selbstcheck (siehe [Markenfreier Selbstcheck](#markenfreier-selbstcheck)) und die Alias-Routen.

---

## Sichtbarkeit: Suche und KI-Antworten

Was am 21.08.2026 aus der Prüfung hervorging und wo es im Code sitzt.

### llms.txt wird erzeugt, nicht gepflegt

`public/llms.txt` und `public/llms-full.txt` entstehen mit **`npm run llms`**
aus [`scripts/llms-txt.ts`](scripts/llms-txt.ts) — abgeleitet aus
`company.ts`, `angebot.ts`, `services.ts`, `principles.ts`,
`client-results.ts`, `testimonials.ts`, `faq.ts`, `glossary.ts`,
`navigation.ts` und dem Wissens-Loader.

**Warum das kein Handbetrieb mehr ist.** Beide Dateien waren zuletzt am
08.07.2026 angefasst worden. Am 20.08.2026 standen darin: die ROI-Garantie als
Aufmacher (am 12.08. von allen Seiten genommen), ein Testimonial von „Frank
Locke, Kanzlei Locke und Partner" (am 02.08. als erfunden gelöscht — erfundene
Bewertungen sind nach Anhang zu § 3 Abs. 3 Nr. 23c UWG abmahnbar), sechs
Leistungen, die es nicht mehr gibt, eine tote Calendly-Adresse, „§ 5 TMG" statt
DDG und eine Seitenliste ohne `/gratis-wissen`, `/warum`, `/solo`,
`/enterprise`, `/glossar` und `/autoren`.

Das war nicht folgenlos: Eine Websuche nach „KITech Software Hannover" gab am
selben Tag eine KI-Antwort zurück, die **wörtlich die Eröffnungszeile von
llms-full.txt** wiedergab und den alten Seitentitel zitierte. Diese Dateien sind
für abrufende Systeme leichter zu lesen als das HTML — eine veraltete Fassung
ist deshalb teurer als gar keine.

⚠️ **Die eine Regel: Hier steht nur, was auf der Website steht.** Keine
Kundennamen ohne Eintrag in `client-results.ts`, keine Zitate ohne Eintrag in
`testimonials.ts`. Wer eine Aussage in llms.txt haben will, trägt sie in die
Datendatei ein — dann erscheint sie auf der Seite *und* dort.

`src/lib/__tests__/llms-txt.test.ts` bricht ab, sobald die Dateien vom Stand der
Datendateien abweichen, und prüft zusätzlich namentlich auf die sechs Fehler von
oben. Nach jeder inhaltlichen Änderung also `npm run llms` und mitcommitten.

### Entitäts-Knoten: Organisation und Website

`getOrganizationSchema()` und `getWebSiteSchema()` werden in
[`PageShell.tsx`](src/components/layout/PageShell.tsx) ausgegeben — auf jeder
Seite genau einmal, mit stabiler `@id` (`ORGANISATION_ID`) und `sameAs`.

**Bis zum 20.08.2026 stand der Knoten auf keiner einzigen Seite.** Die Funktion
war gebaut und mit Unit-Tests abgedeckt, aber nirgends eingebunden: Jede Artikel-
und Autorenseite verwies mit `publisher` bzw. `worksFor` auf
`https://kitech-software.de/#organisation`, und diese Kennung wurde nie mit
einem Knoten belegt. Auf der ganzen Website stand kein `sameAs`.

⚠️ **Nicht ins Root-Layout verschieben.** `/selbstcheck_eu_ai_act` läuft auf
Ansage markenfrei über `CheckShell` — ein Organisations-Knoten mit Firmenname,
Anschrift und Telefonnummer im Kopf wäre genau das, was dort nicht hingehört.
`PageShell` trifft die richtige Menge; der Selbstcheck enthält weiterhin **null**
Nennungen von „KITech" und kein JSON-LD.

`getLocalBusinessSchema()` auf `/kontakt` trägt dieselbe `@id`, damit
Öffnungszeiten und Geokoordinaten in dieselbe Entität fließen statt eine zweite
aufzumachen.

`sameAs` enthält bewusst nur Profile, die KITech gehören (LinkedIn,
ProvenExpert). Creditreform und Companyhouse führen die Firma zwar, sind aber
abgeschriebene Registerdaten und antworten Crawlern mit 403 — ein `sameAs`, das
ein Prüfer nicht abrufen kann, belegt nichts.

### LCP: was gemessen wurde

Zwei Ursachen, beide behoben, beide nachgemessen (Chrome, Mobil-Emulation,
4-fache CPU-Drosselung):

| Was | Wirkung |
|---|---|
| `.kinetic-morph-in` lief von `opacity: 0` mit `fill-mode: both`. Chrome zählt ein durchsichtiges Element nicht als gezeichnet — die H1 ist auf jeder Seite der LCP-Kandidat. | Startseite live: **2492 ms → 1672 ms** |
| Auf Artikelseiten war der **Cookie-Banner-Absatz** das größte gezeichnete Element (51.168 px² gegen 47.880 px² des Artikel-Aufmachers). | Artikelseite: LCP **3,6 s → 2,9 s**, und das LCP-Element ist wieder der Artikel |

Die Animation animiert seit dem 20.08.2026 **nur noch `transform`**. Wer dort
wieder `opacity` einbaut, zahlt den Betrag erneut, und zwar auf jeder Seite.
Der Banner ist auf dem Handy enger gesetzt (`text-[13px] leading-[1.5]`, ab `md`
unverändert) — **kein Wort ist entfallen**, nur Schriftgröße und Zeilenabstand.

Im selben Zug: Lighthouse-Barrierefreiheit auf **100** (zwei Kontrastfehler bei
3,1 bzw. 3,2 : 1), und Hero-Portrait wie Logo tragen feste Maße gegen die
Layoutverschiebung.

### Bilder: Logo und Vorschaubild

- **`public/images/logo-weiss.webp`** (5,6 KB) ersetzt `public/logo-weiss.svg`
  (178 KB) in Kopf- und Fußzeile. Die SVG-Datei war kein Vektor, sondern ein
  1584x500 großes Graustufen-PNG als base64 plus ein `feColorMatrix`, der daraus
  Weiß mit Deckkraft aus der Helligkeit machte. Sie war damit die größte
  Ressource der Website und stand auf jeder Seite zweimal. Die Quelldatei bleibt
  liegen.
- **`public/images/og/standard.png`** (1200x630) ersetzt das Vorschaubild auf
  `storage.googleapis.com/gpt-engineer-file-uploads/…` — ein fremder Bucket aus
  der Lovable-Herkunft des Projekts, der auch das `image` jedes
  `BlogPosting`-Schemas trug. Neu rendern mit `npm run og`
  ([Vorlage](scripts/og/standard.html)); braucht Chrome und `puppeteer-core`.

### Titel- und Beschreibungslängen

`TITEL_MAX = 60`, `BESCHREIBUNG_MAX = 155` in
[`src/lib/metadata.ts`](src/lib/metadata.ts), dazu `kuerze()` für Texte, die aus
Datendateien kommen. Geprüft von `src/lib/__tests__/metadaten.test.ts` — der
Test fand am 20.08.2026 vier Beschreibungen und einen Titel über der Grenze, die
in der reinen Sichtprüfung durchgerutscht waren.

Dabei entfallen: der Zusatz „– KITech Software" auf Artikel-, Autoren-,
Themen- und Hub-Seiten (er wurde ohnehin abgeschnitten), und die Eröffnung der
Startseiten-Beschreibung mit **„99 % der KI-Projekte scheitern"** — eine harte
Zahl ohne Quelle, die auf der Seite selbst an keiner Stelle vorkam.

### Suchkonsolen: Google und Bing

Beide sind seit dem **24.08.2026 bestätigt**. Die Kennungen stehen in
[`src/config/suchkonsolen.ts`](src/config/suchkonsolen.ts) und werden vom
Root-Layout als Meta-Tag ausgegeben.

| | |
|---|---|
| Google Search Console | Property-Typ **URL-Präfix**, Sitemap eingereicht — Status „Erfolgreich", **35 Seiten erkannt** |
| Bing Webmaster Tools | eigene Meta-Tag-Bestätigung, Sitemap eingereicht |

**Warum Meta-Tag und nicht DNS:** Die Nameserver liegen bei Hostinger
(`ns1.dns-parking.com`), ein TXT-Eintrag bräuchte Zugang zu deren Oberfläche.
Der Preis ist der Property-Typ URL-Präfix statt Domain — für diesen Zweck
genügt das, `funnel.` und `fokus.` stehen ohnehin auf `noindex`.

⚠️ **Beide Kennungen bleiben dauerhaft stehen.** Google und Bing prüfen ihr Tag
regelmäßig nach; fällt es weg, verliert die Domain **still** ihren bestätigten
Status und die Daten laufen nicht weiter. Genau die Sorte Zeile, die jemand
später als Altlast entfernt —
[`suchkonsolen.test.ts`](src/lib/__tests__/suchkonsolen.test.ts) hält die
Verdrahtung deshalb fest und prüft zusätzlich auf Platzhaltertext.

ℹ️ Der TXT-Eintrag `MS=ms60455894` in der DNS-Zone ist die
Microsoft-365-Bestätigung, **nicht** Bing. Er hat mit den Suchkonsolen nichts
zu tun.

Der GSC-Import in Bing („Import from Google Search Console") schlug zunächst
fehl: Er zieht nur **bereits bestätigte** Properties, und zu dem Zeitpunkt war
die Google-Bestätigung noch nicht abgeschlossen. Der direkte Weg über „Add a
Site" ist davon unabhängig.

Einrichtung Schritt für Schritt: [`deploy/SUCHKONSOLEN.md`](deploy/SUCHKONSOLEN.md).

### Was noch offen ist

| Offen | Wer |
|---|---|
| ProvenExpert-Profil: aktiv seit 06.11.2025, **0 Bewertungen**. Fünf echte Bewertungen belegen gleichzeitig die Sterne auf den Kundenkarten | Ayham |
| Wirtschaftsförderung Region Hannover führt ein KI-Partner-Verzeichnis (40+ Firmen) ohne KITech; Aufnahme über Ansprechpartner | Ayham |
| `openPoints` der sechs Referenzfälle — solange sie stehen, ist **keine** Detailseite indexiert | Kundenfreigaben |
| `DATAFORSEO_*`, `FIRECRAWL_API_KEY`, `ANTHROPIC_API_KEY` fehlen — die Blog-Pipeline kann nicht laufen | Ayham |
| Zehn von zwölf Themen-Clustern ohne Artikel | Redaktion |
| `techStack` in `services.ts` (PyTorch, Kubernetes, LangChain, Hugging Face) ist Altbestand der Vorgängerseite und steht so auf `/leistungen` **und** in llms-full.txt | inhaltliche Entscheidung |

⚠️ **`FAQPage`-Schema läuft weiter** auf der Startseite und zwei
Glossarseiten, obwohl der Wissensbereich es bewusst weglässt (Google hat das
Rich Result zum 07.05.2026 abgeschaltet). Es ist absichtlich stehen geblieben:
Der sichtbare Text ist identisch, das Markup kostet nichts, und andere abrufende
Systeme lesen strukturierte Frage-Antwort-Paare weiterhin aus. Wer es entfernt,
gewinnt nichts — wer es auf neue Seiten ausrollt, ebenfalls nicht.

## Sicherheit & Compliance

### Security Headers (`next.config.ts`)
**Jetzt aktiv** — gesetzt per `headers()` in `next.config.ts` statt wie früher in
`deploy/security-headers.conf`. Die alte nginx-Konfiguration wurde nie ausgeliefert,
weil Coolify mit nixpacks/Caddy baut und sie gar nicht liest. In der Next-Config
gelten sie unabhängig vom Build Pack.

Gesetzt werden: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
Permissions-Policy, Cross-Origin-Opener-Policy. `X-Powered-By` ist abgeschaltet.

Die CSP enthält Ausnahmen für Plausible (`stats.kitech-software.de`), Calendly
(`assets.calendly.com`, `calendly.com`), den Tracking-Webhook
(`os.kitech-software.de`) und `ipinfo.io`. Wer eine neue externe Verbindung
einbaut, muss sie dort eintragen — sonst blockiert der Browser sie stillschweigend.

### DSGVO / Cookie-Consent
- `CookieConsent.tsx` + `src/lib/consent.ts` (zentrale Helper, `hasAnalyticsConsent()`, localStorage-Key `cookie-consent-v1`)
- Banner erscheint nach 500ms, eine einzige Kategorie "Analytics" (kein separates Marketing/Funktional)
- Plausible-Script wird **nur nach Zustimmung** dynamisch injiziert
- **Calendly-Embed auf `/lass-uns-reden` ist ebenfalls Consent-gated:** laedt automatisch nur bei vorhandenem Analytics-Consent, sonst Klick-Gate ("Kalender laden") - Calendly setzt echte Third-Party-Cookies, wird daher wie Plausible behandelt, nicht als "technisch notwendig" eingestuft.
- Cookie-Einstellungen jederzeit ueber Footer-Link (`window.dispatchEvent(new Event("cookie-consent:open"))`) aenderbar
- Datenschutzerklaerung unter `/datenschutz` — **erwaehnt Calendly als Auftragsverarbeiter aktuell noch nicht explizit**, sollte vor naechster grosser Privacy-Review ergaenzt werden.

---

## Benachrichtigungen: Ereignisse und Tagesbericht

**Auf Ansage (14.08.2026):** „Ich möchte eine Benachrichtigung kriegen … sodass
ich dann auch genau weiß, wer das war."

**Was vorher da war und warum es nichts tat:** `src/lib/visitor-enrichment.ts`
schickte bei jedem zustimmenden Besucher IP, Firma und Ort an
`os.kitech-software.de/api/webhook/tracking`. Unter der Domain läuft seit dem
Umzug eine andere Anwendung — der Pfad antwortet mit **404**, es kam also nie
etwas an. Zusätzlich standen das ipinfo.io-Token und ein Webhook-Secret im
Quelltext und damit im Client-Bundle, und die IP ging aus dem Browser des
Besuchers direkt an einen US-Dienst.

| Weg | Wofür |
|---|---|
| `src/app/api/ereignis/route.ts` | Sofortmeldung. Nimmt `besuch`, `termin_geoeffnet`, `popup_geklickt`, `telefon_geklickt`, `email_geklickt`, `selbstcheck_fertig` und schickt sie an `EREIGNIS_WEBHOOK_URL`. |
| `src/lib/ereignis.ts` | `meldeEreignis()` — die Client-Seite dazu. Nicht zu verwechseln mit `trackEvent()` (Plausible): das eine zählt, das andere klingelt. |
| `src/app/api/tagesbericht/route.ts` | Zahlen des Vortags aus der Plausible-**Query-API v2**, fertig als Text. Wird von außen ausgelöst (n8n/Cron) und ist mit `TAGESBERICHT_SECRET` geschützt. |
| `src/lib/melde-sperre.ts` | Gemeinsame Sperre gegen Dauerfeuer (10 min/Fenster). |

**Was ohne Einwilligung läuft:** das Ereignis selbst — Seite, Referrer, Kampagne.
Kein Cookie, kein localStorage, keine IP im Webhook; deshalb greift § 25 TDDDG
nicht. **Was Einwilligung braucht:** die Firmenerkennung über ipinfo.io. Sie
läuft nur, wenn der Client `mitEinwilligung: true` meldet, und nur, wenn
`IPINFO_TOKEN` gesetzt ist — der Aufruf passiert serverseitig.

⚠️ **Cookie-Banner und `/datenschutz` benennen die Firmenerkennung.** Der Banner
sagte bis dahin „kein Dritt-Tracking", während die Datenschutzerklärung
ipinfo.io bereits vollständig beschrieb — dieser Widerspruch ist aufgelöst.
Wer die Firmenerkennung dauerhaft nicht will, nimmt beide Textstellen mit
heraus. `/datenschutz` hat im selben Zug einen **Calendly-Abschnitt** bekommen
(vorher offen).

Die CSP in `next.config.ts` erlaubt seit dem Umbau **kein** `ipinfo.io` und kein
`os.kitech-software.de` mehr: der Browser spricht nur noch mit der eigenen
Domain.

ℹ️ `/api/funnel-besuch` (Kampagnenseiten) macht dasselbe für `/funnel` und
`/fokus` und ist älter. Die beiden gehören mittelfristig zusammengelegt.

**Nicht eingerichtet = passiert nichts.** Alle Variablen stehen in
`.env.example`; ohne `EREIGNIS_WEBHOOK_URL` bestätigt die Route still mit 204,
ohne `PLAUSIBLE_API_KEY`/`TAGESBERICHT_SECRET` antwortet der Bericht mit 404.

### Der tägliche Bericht kommt per E-Mail

**Auf Ansage (20.08.2026):** „Ich möchte jeden Tag einen Bericht bekommen, wie
viele Leute auf meiner Website sind … so viele Infos wie es geht. Wer war wo,
hat was gedrückt." Kanal ist E-Mail, **nicht** n8n — n8n läuft zwar als
Container, hat aber weder HTTPS noch ein Konto, und der Bericht sollte nicht
darauf warten.

| Teil | Wo |
|---|---|
| Auslöser | Cron im `deploy`-Crontab, täglich 8:00 Europe/Berlin |
| Abfragen + Versand | `scripts/tagesbericht/sende_tagesbericht.py` (nur Python-Standardbibliothek) |
| Zugangsdaten | `/home/deploy/KITech/infra/secrets/tagesbericht.env` (Modus 600), Vorlage liegt im Repo daneben |
| Versandweg | Microsoft Graph, App-Rolle `Mail.Send`, Absender `leon.battel@kitech-software.de` |
| Anleitung | `scripts/tagesbericht/README.md` |

**Das Skript fragt Plausible direkt ab, nicht über `/api/tagesbericht`.** Grund:
jede Erweiterung der Route kostet Rebuild und Deploy der Live-Website, und
dieser Bericht soll wachsen dürfen. Die Route bleibt für den n8n-Weg bestehen —
sie antwortet weiterhin mit 404, weil `PLAUSIBLE_API_KEY` in Coolify **nicht**
gesetzt ist. Das ist Absicht: ein Restart der Live-Anwendung wäre dafür nötig,
und der Bericht braucht sie nicht.

⚠️ **Der Bericht untererfasst — mit Absicht.** Plausible lädt erst nach
Zustimmung im Cookie-Banner, ebenso die Besuchsmeldung
(`visitor-enrichment.ts`). Wer ablehnt oder den Banner ignoriert, taucht in
keiner Zahl auf. Unter jeder Mail steht deshalb ein Satz, der das sagt — sonst
liest sich der Bericht wie eine Vollerhebung. Eine cookielose serverseitige
Zählung wäre auch ohne Einwilligung zulässig (kein Zugriff auf das Endgerät,
§ 25 TDDDG greift nicht), ist aber nicht gebaut.

⚠️ **„Wer war das" beantwortet Plausible nicht** — es speichert bewusst keine
Besucherprofile, kein Cookie, keine IP, keine Wiedererkennung über Tage. Der
Bericht zeigt deshalb Verhalten (welche Seite, welcher Klick, welche Stunde,
welches Land), keine Identität. Firmenerkennung gäbe es nur über
`/api/ereignis` (ipinfo.io, serverseitig, nur mit Einwilligung) — deren
Meldungen verfallen derzeit ungespeichert, weil `EREIGNIS_WEBHOOK_URL` fehlt.

**Einrichtung Schritt für Schritt:** `deploy/BENACHRICHTIGUNGEN.md` — dort steht
auch, was schon gesetzt ist und was noch fehlt. Der fertige n8n-Workflow liegt
als `deploy/n8n-benachrichtigung.json` daneben und wird importiert, nicht
nachgebaut. **n8n** läuft seit dem 14.08.2026 als eigener Coolify-Service
(`n8n-automation`, Projekt „KITech Website") und ist der einzige Empfänger:
wohin die Nachricht am Ende geht — Telegram, E-Mail, CRM — entscheidet der
Workflow, nicht die Website.

## Analytics (Plausible)

Self-hosted auf `stats.kitech-software.de`. **Konfiguration ist seit dem Umzug auf Coolify hardcoded** in `src/lib/plausible.ts` und `CookieConsent.tsx` (Domain/Script-URL/API-Endpoint direkt im Code) — **nicht** mehr ueber `VITE_PLAUSIBLE_*`-Env-Vars (diese stehen als toter Verweis/Referenz noch in `.env.example`, werden aber nicht gelesen).

Custom Events (`src/lib/plausible.ts`, Typ `PlausibleEvent`): `CTA_Klick`, `Kontaktformular_gesendet`, `Calendly_Klick`, `Scroll_90`, `Angebot_Seite`, `Lead_Qualifier_abgeschlossen`, `Telefon_Klick`, `Email_Klick`.

---

## Externe Integrationen

| Service | Verwendung |
|---|---|
| Calendly | Terminbuchung. Einzige aktuelle URL: `calendly.com/kitech-software/roi-analyse`, eingebettet auf `/lass-uns-reden` (Inline-Widget, Consent-gated). Alle anderen Stellen im Code verlinken intern auf `/lass-uns-reden`, nicht mehr direkt auf Calendly. |
| Plausible | Self-hosted Analytics (nur nach Cookie-Consent), siehe oben. |
| **Kundenportal** | Separates Projekt `kitech-app-portal` (Next.js, LogTo-Auth) unter `/home/deploy/KITech/projects/kitech-app-portal` — **ueberholt:** Seit der Next.js-Migration hat diese Website selbst ein Backend, der eingeloggte Bereich liegt hier unter `src/app/app/`. Das separate Projekt wird nicht mehr gebraucht. Im Header steht statt "Anmelden" ein Schloss, bis LogTo TLS hat. |

---

## Hosting

- **Platform:** Selbstgehostet ueber Coolify (VPS), Application "KITech Website"
- **Application-UUID:** `j9vencbq8b2nugo86eimxnku` — API-Token in `/home/deploy/KITech/infra/secrets/coolify-api-token.env`, Dashboard auf `http://localhost:8000`
- **Node:** **22** im Container (`node:22-alpine`), seit 23.08.2026 — Node 20 ist seit April 2026 End-of-Life. `engines` in `package.json` haelt es fest.
- **Build Pack:** **`dockerfile`**, Port **3000** — seit 05.08.2026 umgestellt (vorher nixpacks/Caddy, das reicht fuer Next.js nicht, weil zur Laufzeit ein Node-Server noetig ist). Details in `deploy/COOLIFY.md`.
- **Custom Domain:** `https://kitech-software.de` (+ `www`)
- **Routing:** dateibasiert ueber `src/app/`. Kein SPA-Fallback mehr noetig — der Node-Server beantwortet jede Route direkt.
- **Deploy-Workflow:** Kein automatischer GitHub-Webhook (mehrfach als kaputt verifiziert). Deploys laufen manuell ueber die Coolify-API (`GET /deploy?uuid=...`) nach explizitem Go durch den Auftraggeber — **nicht automatisch nach jedem Push.** Coolify baut den Branch **`main`**; ein Push auf einen Feature-Branch aendert live nichts.
- **Vor jedem Deploy:** `docker build` lokal laufen lassen und den Container gegen die Routen pruefen. Der Coolify-Build nutzt dasselbe `Dockerfile` — was lokal bricht, bricht auch dort.

  ```bash
  npm run lint && npm test && npm run build
  docker build -t kitech-website-test:local .
  docker run -d --name kitech-test -p 8123:3000 kitech-website-test:local
  # Routen abklopfen (200 erwartet, 404 nur fuer Unbekanntes):
  for p in / /warum /leistungen /solo /enterprise /referenzen /haltung \
           /karriere /kontakt /glossar /lass-uns-reden \
           /selbstcheck_eu_ai_act /impressum /datenschutz /agb \
           /gratis-wissen /autoren /autoren/ayham-alkhalil \
           /gratis-wissen/rss.xml /gratis-wissen/thema/ki-strategie \
           /llms.txt /images/og/standard.png /images/logo-weiss.webp \
           /glossar/mlops /karriere/b2b-setter /sitemap.xml /gibt-es-nicht; do
    printf "%-40s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8123$p)"
  done
  docker rm -f kitech-test && docker rmi kitech-website-test:local
  ```

  Dazu das JSON-LD des laufenden Containers:

  ```bash
  node scripts/pruefe-jsonld.mjs http://127.0.0.1:8123
  ```

  `npm start` funktioniert wegen `output: "standalone"` nur eingeschraenkt (Next
  warnt beim Start) — fuer eine echte Pruefung immer den Container nehmen.

### Env-Variablen in Coolify

Gesetzt ist aktuell nur `NIXPACKS_NODE_VERSION` (Altlast, ohne Wirkung). **Nicht gesetzt und offen:**

| Variable | Art | Folge, solange sie fehlt |
|---|---|---|
| `LOGTO_*` | Runtime | Der eingeloggte Bereich funktioniert nicht — ist ohnehin noch nicht freigeschaltet. |
| `NEXT_PUBLIC_APP_URL` | Build-Time | Wird derzeit nirgends gelesen (der Header kuendigt den Mitgliederbereich nicht mehr an). |

Runtime-Variablen brauchen nur einen Neustart, keinen neuen Build. `NEXT_PUBLIC_*` wird in
das Bundle eingebacken und erfordert deshalb einen Rebuild.

---

## Kontaktdaten

**Im Code stehen diese Daten seit dem 05.08.2026 an genau einer Stelle:
`src/config/company.ts`.** Vorher waren Telefonnummern, E-Mail-Adressen und die
Anschrift ueber Header, Footer, Kontaktseite und die Conversion-Bausteine
verteilt — mit zwei verschiedenen Telefonnummern nebeneinander. Wer eine Nummer
aendert, aendert genau diese Datei. Ausgenommen sind die Rechtstexte
(`Impressum.tsx`), wo die Angaben bewusst woertlich im Text stehen.

### Die Firma heisst „KITech Software"

**Ansage 17.08.2026:** „Mach ueberall aus ‚KITech Software UG
(haftungsbeschraenkt)' nur: KITech Software — ausser im Impressum."

| Wo | Was steht dort |
|---|---|
| Alles Sichtbare (Fusszeile, Gruenderwort, `/haltung`, Alt-Texte, Metadaten) | `company.shortName` → **KITech Software** |
| JSON-LD | `name: "KITech Software"`, Firmierung im Feld `legalName` |
| Impressum (Text + Metadaten) | vollstaendige Firmierung, unveraendert |
| Datenschutz „Verantwortliche Stelle", AGB § 1 „Anbieter" | vollstaendige Firmierung — **stehen geblieben**, siehe unten |

⚠️ **Zwei Stellen sind bewusst nicht mitgezogen:** In der Datenschutzerklaerung
benennt der Block „Verantwortliche Stelle" den Verantwortlichen nach Art. 13
DSGVO, in den AGB benennt § 1 den Vertragspartner. Beides ist keine Marke,
sondern die Rechtsperson, mit der jemand einen Vertrag schliesst bzw. gegen die
er Betroffenenrechte ausuebt. Die Kurzform waere dort eine Verschlechterung,
nicht eine Vereinfachung. Wer sie trotzdem kuerzen will, entscheidet das
ausdruecklich — es ist eine Rechtsfrage, keine Designfrage.

Beim selben Durchgang aufgefallen und mitkorrigiert: **die ROI-Garantie stand
noch im JSON-LD** (`getOrganizationSchema`, `getLocalBusinessSchema`:
„wird das vereinbarte ROI-Ziel nicht erreicht, zahlt der Kunde nicht"),
obwohl sie am 12.08.2026 von allen Seiten genommen wurde. Sie ging damit
weiter als Zusage an Google und ist jetzt durch das ersetzt, was tatsaechlich
angeboten wird.

⚠️ **Offen:** Der Glossareintrag `/glossar/roi-garantie` (`src/data/glossary.ts`)
schreibt KITech die Garantie weiterhin zu („wie KITech Software messbaren
wirtschaftlichen Wertbeitrag vertraglich zusichert"). Die Seite ist indexiert.
Entweder den Begriff neutral als Branchenbegriff erklaeren oder den Eintrag
entfernen — beides ist eine inhaltliche Entscheidung.

- **E-Mail:** info@kitech-software.de (allgemein), aalkh@kitech-software.de (Ayham, personalisierte CTAs)
- **Telefon (Festnetz):** +49 (0) 511 89738590
- **Telefon (Mobil, Ayham):** +49 151 64682544 — wird in neueren Komponenten (StickyMobileCTA, ExitIntentPopup) verwendet
- **LinkedIn (Ayham):** [linkedin.com/in/ayham-alkhalil-66bb451b5](https://www.linkedin.com/in/ayham-alkhalil-66bb451b5) — zentral in `founderInfo.linkedinUrl` (`FounderPortrait.tsx`)
- **Adresse:** Wedekindstraße 14, 30161 Hannover
- **HRB:** 230077 (Amtsgericht Hannover)
- **USt-IdNr.:** DE459778632
