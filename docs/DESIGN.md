# Designsystem — Hell / Dunkelblau

Stand 12.08.2026. Vorgabe Ayham: die Seite folgt dem Aufbau von acquisition.com.
Vorher war die Seite dark-first ("KI-Redesign v2", near-black + Signal-Lime).
**Dieses Dokument ist die verbindliche Referenz für jede neue Komponente.**

---

## Die drei Farben

| Rolle | Wert | Token | Einsatz |
|---|---|---|---|
| Signal | `#1B47C4` | `--primary` / `bg-primary` | Buttons, Ankündigungsbalken, Fußzeile, Kennzahlen, Akzente |
| Struktur | `#131A2E` | `--foreground` / `--navbar` | Navigationsleiste, Überschriften, Fließtext |
| Grund | `#FFFFFF` | `--background` | Standardgrund aller Abschnitte |
| Grund, abgesetzt | `#FAFAFA` / `#EFEFEF` | `bg-surface` / `bg-surface-strong` | Abschnitte, die sich vom Weiß absetzen; Bildfelder |

Es gibt **keinen zweiten Akzentton** mehr. Das frühere Signal-Lime (`--accent`)
zeigt jetzt auf dasselbe Dunkelblau — zwei Signalfarben zerlegen die Seite.

**Kein Dark Mode.** `.dark` spiegelt dieselben Werte, damit ein alter
`class="dark"`-Zustand die Seite nicht zerlegt.

---

## Schrift

**Poppins**, eine Familie für alles. Der Charakter kommt aus den Gewichten:

| Gewicht | Einsatz |
|---|---|
| 400 | Fließtext |
| 500 | Navigation |
| 700 | Buttons, Kennzahlen (`kinetic-data`) |
| 800 | Überschriften (`kinetic-display`, global auf `h1`–`h4`) |

`font-thin` und `font-light` sind **raus**: Poppins in 100–300 ist auf hellem
Grund kaum lesbar. Wo im Bestand `font-thin`/`font-light` steht, gehört
`font-normal` (Text) oder `font-semibold`/`font-bold` (Auszeichnung) hin.

Die Utilities `kinetic-display`, `kinetic-data` und `kinetic-morph-in` heißen
weiter so (sie stehen an über hundert Stellen), zeigen aber auf Poppins statt
auf den früheren Variable Font Recursive.

Hero-Überschriften stehen in **Versalien** (`uppercase`) — prägendster Zug der
Vorlage. Für Fließtext und Zwischenüberschriften gilt das nicht.

---

## Bausteine

**Buttons sind Pillen.** `rounded-full`, dunkelblau gefüllt, `font-bold`.
Größen: `h-[46px]` in Karten, `h-[56px]` als Haupt-CTA. Die Varianten in
`src/components/ui/button.tsx` bringen das mit; eigene Buttons bauen es nach.

**Karten sind flach.** Kein Schatten, kein Ring, kein eigener Grund — die
Vorlage arbeitet auf ihren Unterseiten durchgehend ohne solche Kästen, Struktur
entsteht über Typografie, Trennlinien und Abstand. Wo eine Karte Inhalte
wirklich gruppiert (das Referenzraster mit sechs Fällen), bleibt ein feiner
`border border-border`; gerundet wird höchstens mit `rounded-lg`.

**Container**: `SITE_CONTAINER` (= `max-w-site`, 1170 px) aus
`src/components/layout/site-container.ts`. Bis 1024 px nur 10 px Rand je Seite —
so gemessen, bewusst schmal. Für Fließtext `TEXT_CONTAINER`.

**Breakpoint `dt` (1025 px)**: der Punkt, an dem die Vorlage von der mobilen auf
die Desktop-Kopfzeile schaltet. Tailwinds `lg` liegt bei 1024 und greift eine
Pixelbreite zu früh.

**Typo-Skala** (Tokens in `tailwind.config.ts`, alle mit Zeilenhöhe):
`text-hero` 50/57,5 · `text-h1` 48/55,2 · `text-h2` 36/41,4 · `text-h3` 24/27,6 ·
`text-h4` 20/23 · `text-subline` 21/30 · `text-lead` 18/27 · `text-fliess` 15/22,5 ·
`text-mini` 12/15,6.

**Logo**: liegt nur zweifarbig-grau vor und geht auf Navy wie auf der Signalfarbe
unter. Kopf- und Fußzeile setzen deshalb `brightness-0 invert` — das färbt jede
Bildfarbe zu reinem Weiß, wie in der Vorlage. Eine zweite Bilddatei braucht es
dafür nicht.

**Seitenrahmen**: immer `PageShell`. Sie bringt Ankündigungsbalken,
Navigationsleiste und Fußzeile mit.

```tsx
<PageShell backdrop="header">   {/* grauer Kopfbereich, läuft in Weiß aus */}
<PageShell backdrop="surface">  {/* ganze Seite auf #FAFAFA */}
<PageShell backdrop="none">     {/* durchgehend weiß */}
```

---

## Scroll-Verhalten (Kern der Vorgabe)

| Element | Verhalten |
|---|---|
| `AnnouncementBar` (dunkelblau) | `fixed top-0` — **bleibt beim Scrollen stehen** |
| `SiteHeader` (Navy) | läuft im normalen Fluss mit — **verschwindet beim Scrollen** |

Das ist die Umkehrung des Üblichen und ausdrücklich so gewollt. Wer die
Navigationsleiste sticky macht, bricht die Vorgabe.

---

## Was ersatzlos entfallen ist

- **`SignalField` / `SignalBackdrop`** — die Canvas-Animation im Hintergrund war
  ein Element des dunklen Designs. Auf hellem Grund gibt es nichts zu leuchten.
- **`.gradient-text`** — Verlaufstext ist auf Weiß unleserlich. Überschriften
  stehen in `text-foreground`, Kennzahlen in `text-primary`.
- **Solo-/Enterprise-Akzente in Amber und Lime** — beide laufen jetzt über
  dieselbe Signalfarbe, differenziert über die Helligkeit.

---

## Umbau-Regeln für Bestandsseiten

| Vorher (dunkel) | Jetzt (hell) |
|---|---|
| `bg-foreground text-background` (weißer Block) | `bg-primary text-primary-foreground` (dunkelblaue Pille) |
| `bg-black … text-white` (Label) | `bg-primary px-3 py-1 text-primary-foreground` oder weglassen |
| `text-foreground/85`, `/82`, `/88` | `text-muted-foreground` |
| `text-foreground/62`, `/68` | `text-muted-foreground` |
| `border-border/60`, `/40` | `border-border` |
| `bg-[linear-gradient(168deg,hsl(245_28%_13%)…)]` (Kartengrund) | flach, höchstens `border border-border` |
| `bg-card` (im hellen System reines Weiß, auf Weiß unsichtbar) | `bg-surface` |
| `text-accent` (Lime) | `text-primary` |
| `shadow-[0_20px_50px_hsl(0_0%_0%/0.35)]` | `shadow-card` bzw. `shadow-elevated` |
| `font-thin` / `font-light` | `font-normal` |
| `<SignalField … />` | ersatzlos streichen |
| Sektion mit dunklem Eigengrund | `bg-surface` oder `bg-background` im Wechsel |

Prüfen, dass **jede** Textfarbe auf ihrem tatsächlichen Grund lesbar bleibt:
weißer Text gehört nur noch auf Dunkelblau (Fußzeile, Buttons, Balken) und auf das
Navy der Navigationsleiste.
