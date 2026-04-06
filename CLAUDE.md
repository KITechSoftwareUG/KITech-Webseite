# CLAUDE.md – KITech Software Website

> Technische Projektdokumentation für KI-Assistenten und Entwickler.

---

## Projekt-Überblick

**Website:** [kitech-software.de](https://kitech-software.de)  
**Typ:** Corporate Website / Marketing-Seite  
**Unternehmen:** KITech Software UG (haftungsbeschränkt) – KI-Beratung & Softwareentwicklung für den deutschen Mittelstand  
**Standort:** Hannover, Deutschland  
**Geschäftsführer:** A. Alkhalil  
**Sprache:** Deutsch (de_DE)

---

## Commands

```bash
bun run dev        # Dev-Server auf Port 8080
bun run build      # Production Build
bun run lint       # ESLint
bun run preview    # Vorschau des Production Builds
```

Kein Test-Framework konfiguriert. **Kein Next.js** — dies ist ein **Vite + React SPA** mit React Router v6 (Client-Side Rendering). Keine Server-Komponenten, keine API-Routes.

---

## Tech-Stack

| Kategorie | Technologie | Version |
|---|---|---|
| Framework | React | 18.x |
| Build Tool | Vite 5 + SWC | 5.x |
| Sprache | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Animationen | Framer Motion | 12.x |
| Routing | React Router DOM | 6.x |
| UI-Komponenten | shadcn/ui (Radix UI) | – |
| Icons | Lucide React | – |
| Font | Onest (via @fontsource) | – |
| Theme | next-themes (light/dark) | – |
| State/Data | TanStack React Query | 5.x |
| Forms | React Hook Form + Zod | – |
| Toasts | Sonner + Radix Toast | – |
| Analytics | Plausible (self-hosted, Privacy-First, via `.env`) | – |
| Paketmanager | Bun | – |

---

## Projektstruktur

```
/
├── public/
│   ├── favicon.ico           # Favicon
│   ├── robots.txt            # SEO + KI-Crawler-Freigaben
│   ├── sitemap.xml           # XML-Sitemap
│   ├── llms.txt              # Kurzübersicht für KI-Agenten
│   ├── llms-full.txt         # Ausführliche Dokumentation für KI-Agenten
│   ├── _headers              # Security Headers
│   ├── _redirects            # SPA-Fallback: alle Pfade → index.html
│   ├── 404.html              # Fallback 404
│   └── placeholder.svg
├── src/
│   ├── main.tsx              # Entry Point
│   ├── App.tsx               # Router + Provider-Setup
│   ├── App.css
│   ├── index.css             # Design Tokens (CSS Custom Properties)
│   ├── assets/               # Logos, Bilder (importiert als ES6-Module)
│   ├── components/
│   │   ├── layout/           # Header, Footer, Layout-Wrapper
│   │   ├── seo/              # SEOHead, StructuredData (JSON-LD)
│   │   ├── ui/               # shadcn/ui Komponenten (nicht manuell bearbeiten)
│   │   ├── CookieConsent.tsx  # DSGVO Cookie-Banner + Plausible-Injection
│   │   └── NavLink.tsx
│   ├── hooks/                # Custom Hooks (use-mobile, use-toast)
│   ├── lib/                  # Utility-Funktionen (cn/clsx)
│   └── pages/                # Seitenkomponenten
├── .env.example              # Env-Var-Vorlage (nie .env committen)
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── components.json           # shadcn/ui Konfiguration
```

---

## Seiten & Routing

| Route | Datei | Beschreibung |
|---|---|---|
| `/` | `Index.tsx` | Startseite mit Hero (Lamp-Effekt), Referenzen, Produkte, Vergleichstabelle, Prozess, Case Studies, Testimonials, Lead-Qualifier-Popup |
| `/leistungen` | `Leistungen.tsx` | Leistungsportfolio (KI-Audit, LLM, Computer Vision, Assistenten, Datenplattform, MLOps) |
| `/haltung` | `Haltung.tsx` | Unternehmenswerte und Philosophie |
| `/referenzen` | `Referenzen.tsx` | Kundenstimmen, Case Studies |
| `/kontakt` | `Kontakt.tsx` | Kontaktformular, Calendly-Integration, Kontaktdaten |
| `/impressum` | `Impressum.tsx` | Impressum (USt-IdNr.: DE459778632, HRB 230077) |
| `/datenschutz` | `Datenschutz.tsx` | Datenschutzerklärung |
| `/agb` | `AGB.tsx` | Allgemeine Geschäftsbedingungen |
| `*` | `NotFound.tsx` | 404-Seite |

---

## Wichtige Konventionen

- **Path Alias:** `@/` → `src/` (konfiguriert in `vite.config.ts` + `tsconfig.json`)
- **TypeScript Strict Mode ist deaktiviert** (`noImplicitAny: false`, `strictNullChecks: false`)
- **shadcn/ui Komponenten** liegen in `src/components/ui/` — bei neuen Komponenten `npx shadcn@latest add <component>` verwenden, nicht manuell hinzufügen
- **Design-System:** CSS Variables (HSL-basiert) in `src/index.css`, konfiguriert in `tailwind.config.ts`
- **Custom Tailwind Utilities:** `.gradient-text`, `.gradient-cta`, `.shadow-soft`, `.shadow-card`
- **Schriftart:** Onest (`@fontsource/onest`)

---

## Design System

### Farbschema (HSL-basiert, CSS Custom Properties)

**Light Mode:**
- `--background`: 210 40% 98% (helles Blaugrau)
- `--foreground`: 222 47% 11% (dunkles Blau)
- `--primary`: 217 91% 60% (kräftiges Blau)
- `--muted-foreground`: 215 16% 47%
- `--border`: 214 32% 91%

**Dark Mode:**
- `--background`: 222 47% 2% (fast Schwarz)
- `--foreground`: 210 40% 98% (helles Grau)
- `--primary`: 217 91% 60% (gleiches Blau)
- `--muted-foreground`: 215 20% 65%
- `--border`: 217 33% 17%

### Typografie
- **Font:** Onest (Gewichte 100–700)
- **Body:** `font-thin` (100) als Default
- **Überschriften:** `font-light` (300) bis `font-medium` (500)

### Gradients & Shadows
- `--gradient-hero`: 135°, Primary → Cyan
- `--gradient-cta`: 135°, Primary-basiert
- `--shadow-soft`, `--shadow-card`, `--shadow-elevated`

### Custom Button-Varianten
- `hero`: Gradient-Button mit Glow-Effekt
- `heroOutline`: Outline-Variante des Hero-Buttons

### Container
- Max-Width: 1280px, zentriert, 1rem Padding

---

## SEO-Architektur

### Meta-Tags (SPA-dynamisch)
- `SEOHead`-Komponente setzt pro Seite: `<title>`, `<meta description>`, OpenGraph, Twitter Cards, Canonical URL
- Base URL: `https://kitech-software.de`
- OG-Image: Gehostetes Social-Image
- Locale: `de_DE`

### Structured Data (JSON-LD)
`src/components/seo/StructuredData.tsx` enthält:
- `Organization` Schema
- `LocalBusiness` Schema
- `WebPage` Schema (pro Seite)
- `Review` Schema (Kundenstimmen)
- `SoftwareApplication` Schema (ethixAI)
- `FAQ` Schema (Startseite)

Bei Content-Änderungen diese Datei ggf. mitpflegen.

### KI-Crawler-Optimierung
- `robots.txt`: Explizite Allow-Regeln für GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot
- `llms.txt`: Kompakte Projektübersicht im Markdown-Format
- `llms-full.txt`: Ausführliche Dokumentation für KI-Agenten
- `sitemap.xml`: Alle Seiten gelistet

---

## Sicherheit & Compliance

### Security Headers (`public/_headers`)
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security (HSTS)

### DSGVO
- Cookie-Consent-Banner (`CookieConsent.tsx`)
  - Erscheint nach 500ms Delay
  - Speichert Präferenz in `localStorage` (Key: `cookie-consent-v1`)
  - Plausible-Script wird **nur nach Zustimmung** dynamisch injiziert
  - Cookie-Einstellungen jederzeit über Footer-Link änderbar
- Datenschutzerklärung unter `/datenschutz`

---

## Analytics (Plausible)

Self-hosted auf VPS (`stats.kitech-software.de`). Script wird **nie hardcoded** in `index.html` — nur `CookieConsent.tsx` injiziert es nach Consent.

Konfiguration via Umgebungsvariablen:

```
VITE_PLAUSIBLE_DOMAIN=kitech-software.de
VITE_PLAUSIBLE_SRC=https://stats.kitech-software.de/js/script.js
VITE_PLAUSIBLE_API_HOST=https://stats.kitech-software.de/api/event
```

Alle Vite-Env-Variablen müssen mit `VITE_` prefixed sein, um im Browser verfügbar zu sein.

---

## Kernfeatures der Startseite

1. **Hero-Section:** Lamp-Effekt (animierter Glow), TextRotate-Animation mit wechselnden Stats
2. **Referenzen-Leiste:** Kundenlogos (NiImmo, Alltagshilfe Fischer, cert consulting, KREMA, ExpatVantage)
3. **Eigene Produkte:**
   - CleverFuchs (iOS App, Coming Soon)
   - ethixAI (SaaS, Live, [ethixAI.io](https://ethixAI.io))
   - Klargehalt (SaaS, erscheint 01.03.2026, [klargehalt.de](https://klargehalt.de))
4. **Lead-Qualifier-Popup:** Mehrstufiges Quiz (Rolle → Branche → Herausforderung → Umsatz → Budget → Calendly CTA), erscheint nach 300px Scroll
5. **Vergleichstabelle:** KITech vs. "typische KI-Agentur"
6. **Prozess:** 3 Schritte (Audit → Entwicklung → Umsetzung)
7. **Case Studies:** Karussell mit 3 Projekten (Immobilien, Consulting, Handwerk)
8. **Testimonials:** Karussell mit Kundenstimmen
9. **CTA-Section:** Erstgespräch über Calendly

---

## Externe Integrationen

| Service | Verwendung |
|---|---|
| Calendly | Terminbuchung (`calendly.com/kitech-software-info/30min`) |
| Plausible | Self-hosted Analytics (nur nach Cookie-Consent) |
| App Store | CleverFuchs Link (Coming Soon) |

---

## Hosting

- **Platform:** Lovable (Hosting + Build)
- **Custom Domain:** `https://kitech-software.de`
- **SPA-Routing:** `_redirects` leitet alle Pfade auf `index.html`

---

## Kontaktdaten

- **E-Mail:** info@kitech-software.de
- **Telefon:** +49 (0) 511 89738590
- **Adresse:** Wedekindstraße 14, 30161 Hannover
- **HRB:** 230077 (Amtsgericht Hannover)
- **USt-IdNr.:** DE459778632
