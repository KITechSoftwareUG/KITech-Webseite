import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
}

const BASE_URL = "https://kitech-software.de";
const DEFAULT_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/PtMzwsuP81OMFsgAS1uxnhIbKCG2/social-images/social-1766141818702-losgo.png";

/**
 * Dynamische Meta-Tags pro Seite. Setzt Title, Description, OG, Twitter, Canonical.
 * Räumt beim Unmount auf (SPA-safe).
 */
export function SEOHead({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
}: SEOHeadProps) {
  useEffect(() => {
    const fullUrl = canonical.startsWith("http")
      ? canonical
      : `${BASE_URL}${canonical}`;

    // Title
    document.title = title;

    // Helper: set or create meta tag
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:url", fullUrl);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:locale", "de_DE");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    if (noindex) {
      setMeta("name", "robots", "noindex, nofollow");
    } else {
      // remove noindex if previously set
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) robotsMeta.remove();
    }

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", fullUrl);
  }, [title, description, canonical, ogType, ogImage, noindex]);

  return null;
}
