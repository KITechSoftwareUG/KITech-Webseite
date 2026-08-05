import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/metadata";

/**
 * Sitemap wird jetzt generiert statt als statische public/sitemap.xml gepflegt.
 *
 * Hier stehen ausschließlich Routen, die auch wirklich indexierbar sind — also
 * ohne `noindex` in ihrer Metadata. Wer hier eine Seite einträgt, die auf
 * noindex steht, schickt Suchmaschinen bewusst ins Leere.
 *
 * Bewusst NICHT enthalten:
 *   - /termin und /selbstcheck (Aliase, Canonical zeigt auf die Hauptroute)
 *   - beide Sales Letter (noch Platzhaltertext, deshalb noindex)
 *   - /skool (leitet permanent auf /community, siehe next.config.ts)
 *   - die einzelnen Referenz-Detailseiten: sie stehen auf noindex, solange in
 *     `client-results.ts` noch `openPoints` offen sind (Platzhaltertexte). Sobald
 *     ein Fall freigegeben ist, hier eintragen.
 *   - der eingeloggte Bereich (eigene Domain app.kitech-software.de, noindex)
 *   - /solo, /enterprise, /leistungen, /haltung, /kontakt, /glossar (Baustelle)
 */
const routes: Array<{
  path: string;
  lastModified: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", lastModified: "2026-07-30", changeFrequency: "weekly", priority: 1.0 },
  { path: "/lass-uns-reden", lastModified: "2026-07-11", changeFrequency: "monthly", priority: 0.9 },
  { path: "/referenzen", lastModified: "2026-08-02", changeFrequency: "monthly", priority: 0.8 },
  { path: "/community", lastModified: "2026-08-05", changeFrequency: "monthly", priority: 0.9 },
  { path: "/eu-ai-act-selbstcheck", lastModified: "2026-07-28", changeFrequency: "monthly", priority: 0.8 },
  { path: "/impressum", lastModified: "2026-07-10", changeFrequency: "yearly", priority: 0.3 },
  { path: "/datenschutz", lastModified: "2026-07-10", changeFrequency: "yearly", priority: 0.3 },
  { path: "/agb", lastModified: "2026-07-10", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${BASE_URL}${route.path === "/" ? "" : route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
