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

const DEFAULT_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/PtMzwsuP81OMFsgAS1uxnhIbKCG2/social-images/social-1766141818702-losgo.png";

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
