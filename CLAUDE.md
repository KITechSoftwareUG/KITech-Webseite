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

**Aktueller Status:** Die Website befindet sich im Relaunch und wurde am 30.07.2026 von **Vite + React Router auf Next.js (App Router) migriert** — Grund: die Funnel-Seiten sollen organisch ranken, was mit einer Client-Side-SPA nicht geht. Startseite, Terminbuchung, Rechtstexte und der EU-AI-Act-Selbstcheck sind echte Seiten; die übrigen Routen zeigen weiterhin Baustelle oder Platzhalter. Siehe [Seiten & Routing](#seiten--routing).

---

## Commands

```bash
npm run dev        # Dev-Server auf Port 8080
npm run build      # Production Build
npm run lint       # ESLint
npm test           # Vitest
npm run preview    # Vorschau des Production Builds
```

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
│   ├── sitemap.xml            # XML-Sitemap (aktuell: nur indexierbare Routen, siehe unten)
│   ├── llms.txt                # Kurzuebersicht fuer KI-Agenten (kann hinter aktuellem Stand liegen)
│   ├── llms-full.txt           # Ausfuehrliche Doku fuer KI-Agenten (kann hinter aktuellem Stand liegen)
│   ├── 404.html                # Fallback 404
│   └── logo.png                 # Echtes, lokal gebuendeltes Logo (siehe Hinweis in UnderConstruction.tsx)
├── deploy/
│   └── COOLIFY.md               # Deployment-Anleitung (nginx.conf/security-headers.conf entfallen)
├── Dockerfile                  # Multi-Stage Build (node:20-alpine -> nginx:alpine) - aktuell NICHT der aktive Build Pack
├── src/
│   ├── main.tsx                # Entry Point
│   ├── App.tsx                 # Router + Provider-Setup (alle Routen siehe unten)
│   ├── index.css               # Design Tokens (CSS Custom Properties) - dark-first, siehe Design System
│   ├── assets/                 # Logos, Fotos (importiert als ES6-Module)
│   ├── components/
│   │   ├── layout/             # Header, Footer, Layout, FunnelLayout (schlanker Wrapper fuer /solo, /enterprise, /lass-uns-reden)
│   │   ├── seo/                # SEOHead, StructuredData (JSON-LD)
│   │   ├── sections/           # FounderPortrait, SplitHero, EnterpriseCloud (Startseiten-/Funnel-Bausteine)
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
│   │   └── __tests__/           # Vitest-Tests fuer Schemas/Breadcrumbs
│   ├── app/                     # Next.js App Router: layout.tsx, providers.tsx, sitemap.ts, page.tsx je Route
│   └── views/                   # Seiten-Komponenten (Client Components), von app/*/page.tsx eingebunden
│       └── legacy/              # Alt-Seiten, nicht geroutet, aus tsconfig/eslint ausgenommen
├── .env.example                 # Env-Var-Vorlage (nie .env committen)
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── components.json              # shadcn/ui Konfiguration
```

---

## Seiten & Routing

**Wichtig:** `src/App.tsx` routet aktuell fast alle Pfade auf dieselbe Komponente (`UnderConstruction.tsx`), unabhaengig vom Pfad. Die "vollen" Seiten existieren als Code, sind aber nicht erreichbar, bis sie in `App.tsx` explizit wieder verdrahtet werden.

### Aktuell live (was Besucher tatsaechlich sehen)

| Route | Datei | Status |
|---|---|---|
| `/`, `/solo`, `/enterprise`, `/leistungen`, `/haltung`, `/referenzen`, `/kontakt`, `/glossar`, `/glossar/:slug`, `*` | `UnderConstruction.tsx` | Baustellen-Seite: Hero, rotierendes Foto (Ayham/Leon), Kontaktzeile, Referenzlogo-Marquee. `noindex` gesetzt. |
| `/lass-uns-reden` | `LassUnsReden.tsx` | Einzige "echte", indexierbare neue Seite: links Mini-Funnel (Foto+Headline, Testimonials, Positionierung), rechts Calendly-Inline-Embed (Consent-gated, siehe unten). Ziel aller "Erstgespraech"-CTAs im ganzen Repo. |
| `/impressum`, `/datenschutz`, `/agb` | `Impressum.tsx`, `Datenschutz.tsx`, `AGB.tsx` | Rechtlich verpflichtend, immer live, immer indexierbar. |

### Vorhanden im Code, aktuell nicht geroutet (Basis fuer den Relaunch)

| Datei | Beschreibung |
|---|---|
| `Index.tsx` | Alte/urspruengliche Startseite. Vorsicht: enthaelt teils veraltete Referenzen (z.B. die frueher hier beschriebene Vergleichstabelle "KITech vs. typische KI-Agentur" existiert in dieser Datei nicht mehr). |
| `Leistungen.tsx` | Leistungsportfolio. |
| `Haltung.tsx` | Werte/Philosophie, Gruender-Editorial (nutzt `FounderPortrait` variant="editorial"). |
| `Referenzen.tsx` | Kundenlogos + Case Studies (Carousel), Logos verlinken auf die jeweilige Kunden-Website wo bekannt. |
| `Kontakt.tsx` | Kontaktformular, Calendly-CTA (-> `/lass-uns-reden`), `FounderPortrait` variant="compact". |
| `Solo.tsx` / `Enterprise.tsx` | Zwei-Wege-Funnel (Einzel-Coaching vs. Enterprise AI), erreichbar ueber `SplitHero.tsx` auf der (aktuell nicht gerouteten) Startseite. Nutzen `FunnelLayout` (kein Haupt-Header, kein StickyMobileCTA/ExitIntentPopup - bewusst schlank). |
| `Glossar.tsx` / `GlossarTerm.tsx` | Glossar-Uebersicht + Detailseiten. |
| `NotFound.tsx` | 404, aktuell nicht erreichbar (catch-all zeigt `UnderConstruction`). |

---

## Wichtige Konventionen

- **Path Alias:** `@/` → `src/` (konfiguriert in `vite.config.ts` + `tsconfig.json`)
- **TypeScript Strict Mode ist deaktiviert** (`noImplicitAny: false`, `strictNullChecks: false`)
- **shadcn/ui Komponenten** liegen in `src/components/ui/` — bei neuen Komponenten `npx shadcn@latest add <component>` verwenden, nicht manuell hinzufügen
- **Design-System:** CSS Variables (HSL-basiert) in `src/index.css`, konfiguriert in `tailwind.config.ts`
- **Custom Tailwind Utilities:** `.gradient-text` (nur in Alt-Seiten wie Referenzen/Leistungen/Haltung/Kontakt, in neuen Komponenten bewusst vermieden), `.gradient-cta`, `.shadow-soft`, `.shadow-card`, `.shadow-elevated`, `.animate-marquee`, `box-decoration-clone` (Tailwind-Core-Utility, fuer Highlight-Boxen hinter mehrzeiligem Text)
- **Schriftart:** Onest (`@fontsource/onest`)
- **Eckige statt runde Flaechen:** Neuere Komponenten (Baustellen-Seite, `/lass-uns-reden`) verwenden bewusst **keine** `rounded-*`-Klassen — scharfkantige, klar umrandete Boxen statt runder Pill-Badges, siehe Kommentar in `UnderConstruction.tsx`. Aeltere Seiten (Referenzen, Kontakt, CookieConsent) nutzen weiterhin `rounded-*`. Bei neuen Komponenten im Zweifel scharfkantig bauen.
- **CTA-Konvention:** Jeder "Erstgespraech buchen"/Calendly-Button im gesamten Repo navigiert intern zu `/lass-uns-reden` (per `<Link>`/`useNavigate`), **niemals** mehr `window.open()` zu einer externen Calendly-URL. Die einzige verbleibende externe Calendly-URL ist die `data-url` im Embed selbst (`LassUnsReden.tsx`).

---

## Design System

### Farbschema (HSL-basiert, CSS Custom Properties)

**Aktuell dark-first ("KI-Redesign v2"):** `:root` und `.dark` sind beide near-black und liegen nur wenige Prozentpunkte auseinander — es gibt kein klassisches helles Light-Mode mehr, obwohl `next-themes` in `App.tsx` noch mit `defaultTheme="light"` konfiguriert ist und der Theme-Toggle im Header weiterhin funktioniert.

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
- **Display-Font:** "Recursive Variable" (`kinetic-display`-Klassen) fuer Headlines auf den neu gebauten Seiten (Baustellen-Seite, Solo, Enterprise) - animiert zwischen serifenlos/mono-Achsen. Aeltere Seiten bleiben bei Onest fuer Headlines.

### Custom Button-Varianten (`src/components/ui/button.tsx`)
- `hero` / `cta`: gefuellter Primary-Button mit Shadow
- `heroOutline` / `ctaOutline`: Outline-Varianten
- Alle Varianten nutzen `rounded-lg` als Basis — neuere Komponenten ueberschreiben das haeufig mit eigenen, eckigen Containern statt den Button direkt zu stylen.

### Container
- Max-Width: 1280px (`2xl` Breakpoint), zentriert, 1rem Padding

---

## SEO-Architektur

### Meta-Tags (serverseitig gerendert)
- `buildMetadata()` in `src/lib/metadata.ts` erzeugt pro Seite Title, Description, OpenGraph, Twitter Cards, Canonical und optional `noindex`. Wird in `src/app/*/page.tsx` als `export const metadata` genutzt. Die frühere `SEOHead`-Komponente (useEffect-basiert) ist damit abgelöst.
- **Sitemap wird generiert** (`src/app/sitemap.ts`), nicht mehr als `public/sitemap.xml` gepflegt. Dort gehören nur indexierbare Routen hinein.
- Base URL: `https://kitech-software.de`
- Locale: `de_DE`

### Structured Data (JSON-LD)
`src/components/seo/StructuredData.tsx` — Schema-Funktionen fuer Organization, LocalBusiness, WebPage, Breadcrumb, Review, FAQ, Person (Gruender), ItemList (Kunden), Enterprise-Cloud-spezifische Schemas. Bei Content-Aenderungen diese Datei ggf. mitpflegen. Zod-Validierung der erzeugten Schemas in `src/lib/schema-validators.ts` + `src/lib/__tests__/`.

### KI-Crawler-Optimierung
- `robots.txt`: Explizite Allow-Regeln fuer GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot
- `llms.txt` / `llms-full.txt`: Kompakte bzw. ausfuehrliche Projektuebersicht fuer KI-Agenten — **koennen hinter dem aktuellen Code-Stand zuruecklieben** (z.B. erwaehnen sie nicht `/solo`, `/enterprise`, `/lass-uns-reden`), vor Verlass darauf gegenpruefen.
- `sitemap.xml`: Aktuell nur indexierbare Routen (Impressum, Datenschutz, AGB, `/lass-uns-reden`) - die Baustellen-Routen sind bewusst nicht gelistet (noindex).

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
| **Kundenportal** | Separates Projekt `kitech-app-portal` (Next.js, LogTo-Auth) unter `/home/deploy/KITech/projects/kitech-app-portal` — technisch notwendig getrennt, da diese Website eine reine Client-Side-SPA ist und LogTo serverseitige Session-Verwaltung braucht (nur mit einem echten Backend wie Next.js moeglich). Deployment liegt im selben Coolify-Projekt ("KITech Website"). Der Header-Button "Anmelden" verlinkt auf `${VITE_PORTAL_URL}/login`. |
| App Store | CleverFuchs Link (Coming Soon) — nur in der aktuell nicht gerouteten `Index.tsx`. |

---

## Hosting

- **Platform:** Selbstgehostet ueber Coolify (VPS), Application "KITech Website"
- **Build Pack:** muss auf **`dockerfile`** umgestellt werden (Port **3000**) — Next.js braucht zur Laufzeit einen Node-Server, nixpacks/Caddy reicht nicht mehr. Details in `deploy/COOLIFY.md`.
- **Custom Domain:** `https://kitech-software.de`
- **Routing:** dateibasiert ueber `src/app/`. Kein SPA-Fallback mehr noetig — der Node-Server beantwortet jede Route direkt.
- **Deploy-Workflow:** Kein automatischer GitHub-Webhook (mehrfach als kaputt verifiziert). Deploys laufen manuell ueber die Coolify-API (`GET /deploy?uuid=...`) nach explizitem Go durch den Auftraggeber — **nicht automatisch nach jedem Push.**

---

## Kontaktdaten

- **E-Mail:** info@kitech-software.de (allgemein), aalkh@kitech-software.de (Ayham, personalisierte CTAs)
- **Telefon (Festnetz):** +49 (0) 511 89738590
- **Telefon (Mobil, Ayham):** +49 151 64682544 — wird in neueren Komponenten (StickyMobileCTA, ExitIntentPopup) verwendet
- **LinkedIn (Ayham):** [linkedin.com/in/ayham-alkhalil-66bb451b5](https://www.linkedin.com/in/ayham-alkhalil-66bb451b5) — zentral in `founderInfo.linkedinUrl` (`FounderPortrait.tsx`), Leons LinkedIn-URL liegt noch nicht vor
- **Adresse:** Wedekindstraße 14, 30161 Hannover
- **HRB:** 230077 (Amtsgericht Hannover)
- **USt-IdNr.:** DE459778632
