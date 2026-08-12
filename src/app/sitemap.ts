import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/metadata";
import { siteRoutes } from "@/config/navigation";
import { clientResults } from "@/data/client-results";
import { glossaryTerms } from "@/data/glossary";
import { wissenArtikel } from "@/data/wissen";

/**
 * Sitemap wird generiert statt als statische `public/sitemap.xml` gepflegt.
 *
 * Die Liste der statischen Routen stand bis zum 05.08.2026 hier als eigenes
 * Array — also parallel zur Navigation, die dieselben Pfade kannte. Beide
 * Listen sind auseinandergelaufen: `/referenzen` und `/community` waren
 * eingetragen, `/leistungen`, `/haltung`, `/kontakt` und `/glossar` fehlten,
 * obwohl es sie gab. Jetzt kommt alles aus `src/config/navigation.ts`.
 *
 * Aufgenommen wird nur, was auch wirklich in den Index darf:
 *   - `indexable: false` → die Seite setzt `noindex` in ihrer Metadata. Wer sie
 *     hier einträgt, schickt Suchmaschinen bewusst ins Leere.
 *   - `aliasOf` → Alias-Route (`/termin`, `/selbstcheck`), deren Canonical auf
 *     die Hauptroute zeigt. Beide zu listen erzeugt Duplicate Content.
 *
 * Dynamische Detailseiten kommen direkt aus den Datendateien, damit sie nicht
 * von Hand nachgetragen werden müssen:
 *   - Referenzfälle: nur mit Langfassung UND ohne offene Punkte. Dieselbe
 *     Bedingung wie das `noindex` in `app/referenzen/[slug]/page.tsx` — läuft
 *     die auseinander, steht ein noindex-Fall in der Sitemap.
 *   - Glossarbegriffe: alle, sie sind fertig geschrieben.
 *   - Artikel aus `/gratis-wissen`: alle. Sie sind der Grund, warum dieser
 *     Bereich existiert — sie sollen ranken.
 *   - Stellenanzeigen: bewusst gar nicht, siehe Kopf von `src/data/jobs.ts`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const statisch: MetadataRoute.Sitemap = siteRoutes
    .filter((route) => route.indexable && !route.aliasOf)
    .map((route) => ({
      url: `${BASE_URL}${route.path === "/" ? "" : route.path}`,
      lastModified: route.lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }));

  const referenzen: MetadataRoute.Sitemap = clientResults
    .filter((result) => result.detail && !result.openPoints?.length)
    .map((result) => ({
      url: `${BASE_URL}/referenzen/${result.slug}`,
      lastModified: "2026-08-05",
      changeFrequency: "yearly" as const,
      priority: 0.6,
    }));

  const glossar: MetadataRoute.Sitemap = glossaryTerms.map((term) => ({
    url: `${BASE_URL}/glossar/${term.slug}`,
    lastModified: term.dateModified ?? "2026-08-05",
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  const wissen: MetadataRoute.Sitemap = wissenArtikel.map((artikel) => ({
    url: `${BASE_URL}/gratis-wissen/${artikel.slug}`,
    lastModified: artikel.datum,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...statisch, ...referenzen, ...glossar, ...wissen];
}
