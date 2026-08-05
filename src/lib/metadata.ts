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
  ogImage?: string;
  /** Setzt robots auf noindex/nofollow — für Seiten ohne fertigen Inhalt. */
  noindex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
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
      images: [ogImage],
      locale: "de_DE",
      siteName: "KITech Software",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
