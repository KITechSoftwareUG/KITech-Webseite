# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev-Server auf Port 8080
npm run build      # Production Build
npm run lint       # ESLint
npm run preview    # Vorschau des Production Builds
```

Kein Test-Framework konfiguriert.

## Stack

**Kein Next.js** — dies ist ein **Vite + React SPA** mit React Router v6 (Client-Side Rendering). Keine Server-Komponenten, keine API-Routes.

| Schicht | Technologie |
|---------|-------------|
| Build | Vite 5 + SWC |
| Routing | React Router 6 (`BrowserRouter`) |
| UI | shadcn/ui (Radix UI Basis) + Tailwind CSS 3.4 |
| Forms | react-hook-form + Zod |
| Animationen | Framer Motion |
| Themes | next-themes (Light/Dark via CSS-Klasse) |
| Analytics | Plausible (Privacy-First, via `.env`) |
| Deployment | Netlify (Static SPA, `_headers` + `_redirects` in `public/`) |

## Architektur

```
src/
├── App.tsx              # Router-Setup mit allen Routes
├── pages/               # Eine Datei pro Route
├── components/
│   ├── layout/          # Header, Footer, Layout
│   ├── seo/             # SEOHead + StructuredData (JSON-LD)
│   └── ui/              # shadcn/ui Komponenten (nicht manuell bearbeiten)
├── hooks/               # use-toast, use-mobile
└── lib/utils.ts         # cn() = clsx + tailwind-merge
```

**Routes:**
- `/` → `Index.tsx` (Homepage)
- `/leistungen`, `/haltung`, `/referenzen`, `/kontakt`
- `/impressum`, `/datenschutz`, `/agb`

## Wichtige Konventionen

- **Path Alias:** `@/` → `src/` (konfiguriert in `vite.config.ts` + `tsconfig.json`)
- **TypeScript Strict Mode ist deaktiviert** (`noImplicitAny: false`, `strictNullChecks: false`)
- **shadcn/ui Komponenten** liegen in `src/components/ui/` — bei neuen Komponenten `npx shadcn@latest add <component>` verwenden, nicht manuell hinzufügen
- **Design-System:** CSS Variables (HSL-basiert) in `src/index.css`, konfiguriert in `tailwind.config.ts`
- **Custom Tailwind Utilities:** `.gradient-text`, `.gradient-cta`, `.shadow-soft`, `.shadow-card`
- **Schriftart:** Onest (`@fontsource/onest`)

## SEO

`src/components/seo/StructuredData.tsx` enthält JSON-LD Schemas (Organization, LocalBusiness, FAQ, Review). Bei Content-Änderungen diese Datei ggf. mitpflegen.

## Umgebungsvariablen

Siehe `.env.example`:
```
VITE_PLAUSIBLE_DOMAIN=
VITE_PLAUSIBLE_SRC=
VITE_PLAUSIBLE_API_HOST=
```
Alle Vite-Env-Variablen müssen mit `VITE_` prefixed sein, um im Browser verfügbar zu sein.
