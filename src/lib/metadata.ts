import type { Metadata } from "next";

/**
 * Ersetzt die frühere `SEOHead`-Komponente (die Meta-Tags per useEffect ins DOM
 * schrieb). Mit Next.js rendert der Server die Tags direkt ins HTML — genau der
 * Grund für den Umzug: Suchmaschinen bekommen fertiges Markup statt nachgereichter
 * Tags.
 *
 * Verwendung in einer Server-Component-Seite:
 *   export const metadata = buildMetadata({ title, description, path: "/pfad" })
 */

export const BASE_URL = "https://kitech-software.de";

/**
 * Standard-Vorschaubild beim Teilen und im Article-Markup.
 *
 * Exportiert, weil das Artikel-Schema ein `image` braucht: Es ist die einzige
 * Article-Eigenschaft, zu der Google konkrete Anforderungen nennt (mindestens
 * 50.000 Pixel Fläche, Seitenverhältnisse 16:9, 4:3, 1:1). Ein fehlendes `image`
 * wäre die auffälligste Lücke im Markup — bis es artikeleigene Bilder gibt,
 * steht hier dieses.
 *
 * **Seit dem 20.08.2026 auf der eigenen Domain.** Vorher zeigte diese Konstante
 * auf `storage.googleapis.com/gpt-engineer-file-uploads/…` — einen fremden
 * Bucket aus der Lovable-/gpt-engineer-Herkunft des Projekts. Die Adresse
 * antwortete zwar, aber sie gehörte KITech nicht: Wer sie abschaltet, nimmt
 * jeder Seite das Teilen-Bild und jedem Artikel das `image` im Schema. Das alte
 * Bild war zudem 1024x1024 und wurde von LinkedIn, X und Facebook beschnitten,
 * die 1200x630 erwarten.
 *
 * Das neue Bild entsteht mit `npm run og` (siehe `scripts/og-standardbild.mjs`)
 * und liegt als Datei im Repo — nicht über `opengraph-image.tsx`, weil dessen
 * URL einen wechselnden Hash trägt und diese Adresse auch im JSON-LD steht.
 */
export const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og/standard.png`;

/**
 * Zeichenzahlen, ab denen Google im Suchergebnis abschneidet.
 *
 * Es sind keine harten Grenzen — Google rechnet in Pixeln und schreibt
 * Beschreibungen ohnehin oft selbst um. Als Zielkorridor taugen sie trotzdem:
 * Was darüber liegt, wird auf dem Handy verlässlich gekürzt, und gekürzt wird
 * am Ende — also genau dort, wo bei uns meistens der Nutzen steht.
 *
 * Geprüft in `src/lib/__tests__/metadaten.test.ts`, damit es nicht wieder
 * auseinanderläuft: Am 20.08.2026 lagen sechs Seiten darüber, die Startseite
 * mit 230 Zeichen.
 */
export const TITEL_MAX = 60;
export const BESCHREIBUNG_MAX = 155;

/**
 * Kürzt an der Wortgrenze und hängt ein Auslassungszeichen an.
 *
 * Für Texte, die aus Datendateien kommen und nicht für die Suche geschrieben
 * wurden — Autorenbeschreibungen zum Beispiel. Ein hartes `slice(0, 200)` wie
 * vorher zerschneidet mitten im Wort und liegt zusätzlich über der Grenze.
 */
export function kuerze(text: string, max: number = BESCHREIBUNG_MAX): string {
  if (text.length <= max) return text;

  const schnitt = text.slice(0, max - 1);
  const letzteLuecke = schnitt.lastIndexOf(" ");
  const basis = letzteLuecke > max * 0.6 ? schnitt.slice(0, letzteLuecke) : schnitt;

  return `${basis.replace(/[,;:.\s]+$/, "")}…`;
}

interface BuildMetadataOptions {
  title: string;
  description: string;
  /** Pfad ab Domainwurzel, z. B. "/referenzen". */
  path: string;
  ogType?: "website" | "article";
  /**
   * Vorschaubild beim Teilen. `null` lässt den Eintrag weg — dann greift die
   * Datei-Konvention von Next.js (`opengraph-image.tsx` im Routenordner).
   * Nötig für markenfreie Seiten: das Standardbild ist das Firmenlogo.
   */
  ogImage?: string | null;
  /** Absender beim Teilen. `null` lässt ihn weg — siehe `ogImage`. */
  siteName?: string | null;
  /** Setzt robots auf noindex/nofollow — für Seiten ohne fertigen Inhalt. */
  noindex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  siteName = "KITech Software",
  noindex = false,
}: BuildMetadataOptions): Metadata {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      type: ogType,
      url,
      ...(ogImage ? { images: [ogImage] } : {}),
      locale: "de_DE",
      ...(siteName ? { siteName } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
