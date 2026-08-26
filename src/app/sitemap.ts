import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/metadata";
import { siteRoutes } from "@/config/navigation";
import { clientResults } from "@/data/client-results";
import { glossaryTerms } from "@/data/glossary";
import {
  alleAutoren,
  alleCluster,
  artikelImCluster,
  veroeffentlichteArtikel,
} from "@/lib/wissen/laden";

/**
 * Sitemap wird generiert statt als statische `public/sitemap.xml` gepflegt.
 *
 * Die Liste der statischen Routen stand bis zum 05.08.2026 hier als eigenes
 * Array — also parallel zur Navigation, die dieselben Pfade kannte. Beide
 * Listen sind auseinandergelaufen. Jetzt kommt alles aus
 * `src/config/navigation.ts`.
 *
 * Aufgenommen wird nur, was auch wirklich in den Index darf:
 *   - `indexable: false` → die Seite setzt `noindex` in ihrer Metadata. Wer sie
 *     hier einträgt, schickt Suchmaschinen bewusst ins Leere.
 *   - `aliasOf` → Alias-Route (`/termin`, `/selbstcheck`), deren Canonical auf
 *     die Hauptroute zeigt. Beide zu listen erzeugt Duplicate Content.
 *
 * **Seit dem 19.08.2026 ohne `priority` und `changeFrequency`.** Googles
 * Sitemap-Dokumentation sagt wörtlich: „Google ignores <priority> and
 * <changefreq> values." Beide Felder standen für jede Route gepflegt hier und
 * haben nie etwas bewirkt. Übrig bleibt `lastModified` — das einzige Feld, das
 * ausgewertet wird, und zwar nur, solange es stimmt. Gary Illyes dazu: „if your
 * page changed 7 years ago, but you're telling us in the lastmod element that it
 * changed yesterday, eventually we're not going to believe you anymore."
 *
 * ⚠️ **Deshalb niemals `new Date()` einsetzen.** Ein Build-Zeitstempel für alle
 * Einträge behauptet bei jedem Deploy, die ganze Website habe sich geändert —
 * und ist genau das Verhalten, für das Google einem das Signal entzieht. Jeder
 * Artikel liefert sein eigenes `aktualisiert`.
 *
 * Dynamische Detailseiten kommen direkt aus den Datendateien:
 *   - Referenzfälle: nur mit Langfassung UND ohne offene Punkte. Dieselbe
 *     Bedingung wie das `noindex` in `app/referenzen/[slug]/page.tsx`.
 *   - Glossarbegriffe: alle, sie sind fertig geschrieben.
 *   - Artikel aus `/gratis-wissen`: alle veröffentlichten. Entwürfe stehen nicht
 *     drin, weil es sie auf der Website nicht gibt.
 *   - Themen-Hubs: nur die mit mindestens einem Artikel — ein leerer Hub wird
 *     gar nicht erst gebaut.
 *   - Autorenseiten: alle. Sie sind Vertrauensseiten und sollen gefunden werden.
 *   - Stellenanzeigen: bewusst gar nicht, siehe Kopf von `src/data/jobs.ts`.
 *
 * **Wann diese Datei zum Problem wird:** `sitemap.ts` ist ein Route Handler, den
 * Next.js zur Bauzeit auswertet und danach zwischenspeichert. Solange die Artikel
 * als Dateien im Repo liegen, ist das richtig — die Sitemap ändert sich ohnehin
 * nur beim Deploy. Sobald sie aus einer Datenbank kämen, stünde hier der Stand
 * des letzten Builds, bis der nächste läuft. Dann gehört ein `revalidate`
 * hierher. Das ist ein sehr unauffälliger Fehler.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  /*
   * Die beiden Blog-Hubs datieren sich aus ihrem Bestand statt aus einem festen
   * Wert in navigation.ts. Dort stand der 19.08.2026 — der Tag, an dem sie
   * angelegt wurden. Seither sind vier Artikel dazugekommen, und bei jedem
   * weiteren wäre das Datum erneut überholt: Google bekäme gemeldet, die
   * Übersichtsseite habe sich seit einer Woche nicht geändert, während unten
   * neue Einträge stehen.
   *
   * Ein fester Wert in navigation.ts bleibt für alle anderen Seiten richtig —
   * /leistungen ändert sich nur, wenn jemand die Datei anfasst.
   */
  const jüngsterArtikel = veroeffentlichteArtikel()
    .map((artikel) => artikel.aktualisiert)
    .sort()
    .at(-1);

  const statisch: MetadataRoute.Sitemap = siteRoutes
    .filter((route) => route.indexable && !route.aliasOf)
    .map((route) => ({
      url: `${BASE_URL}${route.path === "/" ? "" : route.path}`,
      lastModified:
        (route.path === "/gratis-wissen" || route.path === "/autoren") && jüngsterArtikel
          ? jüngsterArtikel
          : route.lastModified,
    }));

  const referenzen: MetadataRoute.Sitemap = clientResults
    .filter((result) => result.detail && !result.openPoints?.length)
    .map((result) => ({
      url: `${BASE_URL}/referenzen/${result.slug}`,
      lastModified: "2026-08-05",
    }));

  const glossar: MetadataRoute.Sitemap = glossaryTerms.map((term) => ({
    url: `${BASE_URL}/glossar/${term.slug}`,
    lastModified: term.dateModified ?? "2026-08-05",
  }));

  const wissen: MetadataRoute.Sitemap = veroeffentlichteArtikel().map((artikel) => ({
    url: `${BASE_URL}/gratis-wissen/${artikel.slug}`,
    lastModified: artikel.aktualisiert,
  }));

  const themen: MetadataRoute.Sitemap = alleCluster()
    .filter((cluster) => cluster.indexierbar)
    .map((cluster) => ({ cluster, artikel: artikelImCluster(cluster.slug) }))
    .filter(({ artikel }) => artikel.length > 0)
    .map(({ cluster, artikel }) => ({
      url: `${BASE_URL}/gratis-wissen/thema/${cluster.slug}`,
      /* Ein Hub ändert sich, wenn sein jüngster Artikel sich ändert — das ist
         die einzige Aussage, die hier nachprüfbar stimmt. */
      lastModified: artikel
        .map((eintrag) => eintrag.aktualisiert)
        .sort()
        .at(-1),
    }));

  const autoren: MetadataRoute.Sitemap = alleAutoren().map((autor) => {
    /* Dieselbe Ableitung wie bei den Themen-Hubs: Eine Autorenseite listet die
       Artikel ihrer Person, sie ändert sich also mit deren jüngstem Stand. Hier
       stand bis zum 26.08.2026 ein festes Datum, das seit dem 19.08. nicht mehr
       stimmte — und bei jedem neuen Artikel erneut veraltet wäre. */
    const eigene = veroeffentlichteArtikel().filter((artikel) => artikel.autor === autor.slug);
    return {
      url: `${BASE_URL}/autoren/${autor.slug}`,
      lastModified:
        eigene
          .map((artikel) => artikel.aktualisiert)
          .sort()
          .at(-1) ?? "2026-08-19",
    };
  });

  return [...statisch, ...referenzen, ...glossar, ...wissen, ...themen, ...autoren];
}
