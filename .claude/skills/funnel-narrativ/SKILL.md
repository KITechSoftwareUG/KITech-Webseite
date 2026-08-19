---
name: funnel-narrativ
description: Use when planning, structuring, sequencing, or auditing the narrative/copy structure of a KITech sales funnel page (section order, hero claim, story beats, testimonial placement, CTA flow) — for German-language direct-response funnels specifically. Triggers on "neuer Funnel", "Funnel gliedern/sequenzieren", "welches Schema", "Section-Reihenfolge", "Hero-Claim planen", "Copy-Struktur". Not for visual/color/typography polish (use impeccable) or backend/deployment.
version: 1.0.0
user-invocable: true
argument-hint: "[schema-a|schema-b|schema-c|schema-d|schema-e|choose|audit] [funnel-name]"
---

# funnel-narrativ

Legt die erzählerische Struktur (Section-Reihenfolge, Beats, Sprache) für KITech-Funnels
fest — damit jeder neue Funnel nach einem von fünf festen, verkaufsoptimierten Schemas
gebaut wird statt ad-hoc erfunden zu werden. Genau das war der wiederkehrende Grund,
warum frühere Funnel-Entwürfe "KI-generiert" wirkten: nicht Farbe oder Font, sondern eine
beliebige statt einer bewährten Beat-Reihenfolge.

**Trigger:** neuer Funnel wird geplant/gebaut; ein bestehender Funnel wird umstrukturiert
oder auf Konversion geprüft; Fragen wie "welche Reihenfolge", "welches Schema", "Funnel
gliedern/sequenzieren", "Hero-Claim + Beats planen", "Copy-Struktur für X".

**Zuständig auch für die Substanz:** `reference/substanz.md` legt fest, was ein
Funnel überhaupt anbieten darf — tiefe Einblicke in echte Lösungen, bevorzugt als
Video, in dem ein Problem tatsächlich gelöst wird. Das ist Vorgabe von Ayham
(18.08.2026) und steht vor jeder Strukturfrage.

**Nicht zuständig für:** reines visuelles Polishing/Farben/Typografie (siehe `impeccable`)
— das Design (Farben, Komponenten, Typografie) gibt diese Website vor (`CLAUDE.md`,
Abschnitt "Design System"), nicht dieses Skill. Auch nicht zuständig für
Backend/Deployment oder das Schreiben der finalen Texte selbst (dieses Skill legt die
Struktur + Sprachregeln fest, nicht die konkrete Wortwahl pro Funnel).

## Setup — immer zuerst

0. **Lies `reference/substanz.md` und kläre zuerst, WAS der Funnel anbietet.**
   Ein Funnel mit dem falschen Angebot ist mit keiner Struktur zu retten — und
   PDFs, Checklisten und „X Tipps" sind seit dem 18.08.2026 ausdrücklich raus.
   Steht das Angebot nicht fest oder ist es dünn, wird das geklärt, bevor
   irgendein Beat geplant wird.
1. Lies `reference/voice.md` (gilt für JEDEN Funnel, unabhängig vom Schema) und
   `reference/bans.md` (harte Verbote, match-and-refuse).
2. Wenn der Nutzer noch kein Schema genannt hat: lies `reference/choosing-a-schema.md`
   und leite aus Traffic-Temperatur + Angebot + verfügbarem emotionalem Hebel ab, welches
   der fünf Schemas passt. Bei echter Unklarheit: eine gezielte Rückfrage, keine Annahme.
3. Lies genau die eine passende `reference/schema-*.md`-Datei. Nicht alle fünf auf
   Verdacht laden.
4. Prüfe `reference/modul-5-tipps.md` — ist ein optionaler Baustein, den jedes Schema an
   der dort beschriebenen Stelle einsetzen kann (nicht nur Schema C).

## Die fünf Schemas

| Schema | Name | Basis | Wann |
|---|---|---|---|
| A | Verbrannt-Funnel | Advertorial-Hook + PAS/Before-After-Bridge | Standard für kalten Traffic (z.B. LinkedIn-Klick von Fremden) |
| B | Proof-Stack-Funnel | VSL-Proof-Stacking | Warmer Traffic (Empfehlung, Retargeting, Newsletter) |
| C | 5-Tipps-Funnel | Native-Ad-Listicle + AIDA | Content-/SEO-Einstieg, Erstkontakt über Mehrwert |
| D | Autoritäts-Funnel | PASTOR, Autorität zuerst | Hochpreisig, starke Personenmarke trägt allein schon Vertrauen |
| E | Quiz-Funnel | Interaktive Qualifizierung | Quiz-/Rechner-Funnel mit personalisiertem Ergebnis |

Details, exakte Beat-Reihenfolge und Beispiele je Schema: `reference/schema-*.md`.

## Anwenden auf bestehende Funnels

`/funnel` und `/fokus` (Inhalt in `src/data/funnel.ts`/`fokus.ts`, Views in
`src/views/Funnel.tsx`/`Fokus.tsx`, erreichbar über die Domains
`funnel.kitech-software.de`/`fokus.kitech-software.de`, Host-Rewrite in
`src/proxy.ts`) laufen auf **Schema A** (siehe `reference/schema-verbrannt.md` für den
Beat-Ablauf) — umgesetzt mit den Bausteinen dieser Seite (`PageHeading`, `ClientResults`,
`CtaBanner`), nicht mit eigenen Komponenten. Beide waren bis zum 11.08.2026 zwei separate
Vite-Repos mit je eigenem Coolify-Deployment (`ki-beratung`, `ki-workshop`) — konsolidiert
in dieses Repo, um nicht drei Repos/Deployments für eine Website zu pflegen.
