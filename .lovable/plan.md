# Plan: A. Alkhalil als Gründer ins Vertrauen einbauen

**Kernbotschaft (überall identisch verwendet):**
> „KI wird überall reingequetscht – ohne klaren ROI. Ich mache es anders."
> — A. Alkhalil, Gründer & Geschäftsführer

Dazu kürzere Varianten je nach Kontext (siehe unten).

---

## 1. Hero – Split-Layout mit freigestelltem Portrait

Aktuell: Lamp-Effekt + zentrierter Text. Neu: zweispaltiges Layout auf `lg:`-Breakpoints.

```text
┌──────────────────────────────────────────────────────┐
│  [Headline + Rotator + CTAs]      [   Portrait   ]   │
│  KI mit ROI-Garantie              [ freigestellt ]   │
│  …                                [  monochrom   ]   │
│  [Termin] [Leistungen]            [ subtler Glow ]   │
│                                   ┌──────────────┐   │
│                                   │ A. Alkhalil  │   │
│                                   │ Gründer      │   │
│                                   │ „… ohne ROI" │   │
│                                   └──────────────┘   │
└──────────────────────────────────────────────────────┘
```

- Mobile: Portrait **unter** dem Text, kleiner (max-w 280px), zentriert.
- Lamp-Effekt bleibt erhalten, wird hinter dem Portrait sichtbar – Portrait sitzt halbtransparent davor → modernes Editorial-Gefühl.
- Kleines „Signatur-Badge" (Initialen-Mark + Name + Rolle + 1-Satz-Zitat) als floating Card unten am Portrait.

## 2. `/haltung` – Editorial Gründer-Portrait

Neuer Abschnitt unterhalb der bestehenden Werte:

- Großes freigestelltes Foto links (oder rechts, alternierend), rechts ein längerer persönlicher Text (3–4 Absätze) in dünner Onest-Schrift:
  - Warum ich KITech gegründet habe
  - Warum ROI-Garantie statt Stundensätze
  - Persönlicher Anspruch / Hintergrund
- Handgesetzte Signatur (SVG-Style: Schriftzug „A. Alkhalil")
- LinkedIn-Link als dezenter Text-Button

## 3. `/kontakt` – Persönlicher Ansprechpartner

- Über dem Calendly-Block: kleines Portrait + „Sie sprechen direkt mit mir." + Name + Rolle
- Beim Calendly-CTA-Button als Avatar daneben → signalisiert: kein Sales-Funnel, sondern direkter Draht zum Gründer.

## 4. Globale CTA-Section (Startseite, vor Footer)

- Mini-Avatar links neben dem CTA-Text: „Ich melde mich persönlich innerhalb von 24h zurück." → erhöht Click-Through auf den Haupt-CTA.

---

## Technische Umsetzung

**Foto-Handling:**
1. Du lädst Foto hoch (jpg/png).
2. Ich lade es via `lovable-assets` als CDN-Asset hoch (`src/assets/alkhalil-portrait.png.asset.json`).
3. Falls noch nicht freigestellt: `imagegen--edit_image` mit `transparent_background=true` → sauberes PNG ohne Hintergrund.
4. Optional zusätzlich monochrome Variante (CSS `filter: grayscale(1)` mit Hover → Farbe, passt zur bestehenden Monochrom-Regel der Brand).

**Neue/geänderte Dateien:**
- `src/components/sections/FounderPortrait.tsx` (neu, wiederverwendbar mit Varianten `hero | editorial | compact | avatar`)
- `src/components/ui/HeroSplit.tsx` oder direkt in `Index.tsx` Hero anpassen (zweispaltiges Grid)
- `src/pages/Haltung.tsx` – Editorial-Section
- `src/pages/Kontakt.tsx` – Ansprechpartner-Block
- `src/pages/Index.tsx` – CTA-Section + Hero-Anpassung
- `src/assets/alkhalil-portrait.png.asset.json` (neu)

**Schema.org:**
- `Person`-Schema für A. Alkhalil mit `jobTitle: "Geschäftsführer"`, `worksFor: KITech Software UG`, `image`, optional `sameAs: [LinkedIn]`
- In Organization-Schema `founder` und `employee` ergänzen → verbessert E-E-A-T und KI-Suche
- Neue Zod-Tests für `PersonSchema`

**Design-Treue:**
- Monochrom-Prinzip wird eingehalten (grayscale default, leichter Color-Hover nur auf Hero)
- Onest thin/light für persönlichen Text
- Light-Mode-only (gemäß Projektregel)
- Mobile-first: alle Layouts kollabieren sauber

---

## Was ich von dir brauche

1. **Foto hochladen** (am besten Brustportrait, Blick in Kamera, neutraler Hintergrund – ich stelle frei).
2. Bestätigung der **Kernbotschaft** (oben) oder eine angepasste Formulierung.
3. Optional: LinkedIn-URL für die Person-Schema-Verknüpfung (vermutlich `https://www.linkedin.com/in/...`).

Sobald das Foto da ist, baue ich alle 4 Touchpoints in einem Durchgang.
