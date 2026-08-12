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
│   ├── llms.txt                # Kurzuebersicht fuer KI-Agenten (liegt hinter dem aktuellen Stand)
│   ├── llms-full.txt           # Ausfuehrliche Doku fuer KI-Agenten (liegt hinter dem aktuellen Stand)
│   ├── images/kunden/           # Kundenfotos fuer die Ergebniskarten
│   └── logo.png                 # Echtes, lokal gebuendeltes Logo
├── deploy/
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
| `/haltung` | `Haltung.tsx` | ja | Werte + Gründerzitat. Inhalt: `src/data/principles.ts`. |
| `/karriere`, `/karriere/[slug]` | `Karriere.tsx`, `KarriereJob.tsx` | **nein** | Stellen sind Platzhalter — siehe [Stellenportal](#stellenportal). |
| `/kontakt` | `Kontakt.tsx` | ja | Kontaktwege, bewusst ohne Formular. |
| `/glossar`, `/glossar/[slug]` | `Glossar.tsx`, `GlossarTerm.tsx` | ja | Sechs Begriffe aus `src/data/glossary.ts`, seit der Migration erstmals wieder erreichbar. |
| `/lass-uns-reden` (`/termin`) | `LassUnsReden.tsx` | ja | Calendly-Inline-Embed, Consent-gated. Ziel aller „Erstgespräch“-CTAs. |
| `/selbstcheck_eu_ai_act` (`/selbstcheck`) | `EuAiActSelbstcheck.tsx` | ja | Interaktiver Check, seit 11.08.2026 **markenfrei** — siehe [Markenfreier Selbstcheck](#markenfreier-selbstcheck). Hieß bis dahin `/eu-ai-act-selbstcheck`; die alte Adresse leitet per 308 weiter. |
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
**ohne Marke** — auf Ansage. Der Check soll als eigenes Werkzeug gelesen werden,
nicht als Unterseite einer Agentur: wer ihn geteilt bekommt, sieht zuerst die
Sache, nicht den Absender.

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

**Umbenennung:** Die Route hieß bis zum 11.08.2026 `/eu-ai-act-selbstcheck`. Die
alte Adresse leitet per 308 weiter (`next.config.ts` + gespiegelt in
`permanentRedirects`, `src/config/navigation.ts`) — sie stand seit Juli in der
Sitemap und ist von außen verlinkt. `buildMetadata` hat für diese Seite zwei
optionale Felder bekommen (`ogImage: null`, `siteName: null`); alle anderen
Seiten bleiben unverändert.

⚠️ **Offen:** Der Unterstrich-Pfad weicht von der kebab-case-Konvention aller
anderen Routen ab (Vorgabe Ayham). Google behandelt `_` nicht als Worttrenner —
für die Suche ist `selbstcheck_eu_ai_act` ein Wort.

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

### Kundenkarten: Ergebnis, Beleglinks, Fotos, Sterne

Alles dazu steht in `src/data/client-results.ts`, gerendert von `ClientResults.tsx`
(Startseite), `ReferenceCard.tsx` (Uebersicht) und `ReferenzDetail.tsx`.

**Die Karte fuehrt mit dem Ergebnis.** Kennzahl gross, darunter eine
Akzent-Unterstreichung, dann Label, ein Satz, die Belegzeilen und der Live-Link.
Am 05.08.2026 war sie kurzzeitig auf Foto, Name, Zitat und Sterne reduziert —
ohne jede Zahl. Das ist auf Ansage zurueckgenommen worden ("ganz prominent die
Ergebnisse zeigen"). Wer sie erneut entkernt, nimmt der Startseite ihren
einzigen harten Beweis.

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
  Bewertungen sind nach § 5b Abs. 3 UWG abmahnbar.
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
- **Reihenfolge im Raster** = Array-Reihenfolge. Benjamin Ronneburg und Leon Battel
  stehen oben, weil nur fuer sie Fotos vorliegen.
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

### KI-Crawler-Optimierung
- `robots.txt`: Explizite Allow-Regeln fuer GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot
- `llms.txt` / `llms-full.txt`: Kompakte bzw. ausfuehrliche Projektuebersicht fuer KI-Agenten — **liegen hinter dem aktuellen Code-Stand zurueck** (sie kennen weder `/warum`, `/karriere` noch die reaktivierten Seiten), vor Verlass darauf gegenpruefen. **Offen:** beide auf den Stand nach dem 05.08.2026 bringen.
- `sitemap.xml`: enthaelt aktuell 21 URLs — alle Hauptseiten, die Rechtstexte und die sechs Glossarartikel. Nicht enthalten: die beiden Sales Letter und `/karriere` (Platzhalterinhalte), die Referenz-Detailseiten (offene Punkte) und die Alias-Routen.

---

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
           /glossar/mlops /karriere/b2b-setter /sitemap.xml /gibt-es-nicht; do
    printf "%-40s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8123$p)"
  done
  docker rm -f kitech-test && docker rmi kitech-website-test:local
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

- **E-Mail:** info@kitech-software.de (allgemein), aalkh@kitech-software.de (Ayham, personalisierte CTAs)
- **Telefon (Festnetz):** +49 (0) 511 89738590
- **Telefon (Mobil, Ayham):** +49 151 64682544 — wird in neueren Komponenten (StickyMobileCTA, ExitIntentPopup) verwendet
- **LinkedIn (Ayham):** [linkedin.com/in/ayham-alkhalil-66bb451b5](https://www.linkedin.com/in/ayham-alkhalil-66bb451b5) — zentral in `founderInfo.linkedinUrl` (`FounderPortrait.tsx`), Leons LinkedIn-URL liegt noch nicht vor
- **Adresse:** Wedekindstraße 14, 30161 Hannover
- **HRB:** 230077 (Amtsgericht Hannover)
- **USt-IdNr.:** DE459778632
