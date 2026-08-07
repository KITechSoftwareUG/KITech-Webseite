import { buildMetadata } from "@/lib/metadata";
import Karriere from "@/views/Karriere";
import { jobsArePlaceholder } from "@/data/jobs";

/**
 * Stellenportal.
 *
 * `noindex` hängt am Zustand der Daten, nicht an einem hier gesetzten Schalter:
 * solange auch nur eine Stelle in `src/data/jobs.ts` als Platzhalter markiert
 * ist, bleibt die Seite aus dem Index — erfundene Stellenanzeigen in der Suche
 * ziehen echte Bewerbungen auf Stellen, die es nicht gibt. Sobald echte Stellen
 * eingetragen sind, wird die Seite beim nächsten Build von selbst indexierbar,
 * und der Eintrag in `src/config/navigation.ts` ist auf `indexable: true` zu
 * setzen, damit sie auch in der Sitemap steht.
 */
export const metadata = buildMetadata({
  title: "Karriere – offene Stellen bei KITech Software",
  description:
    "Offene Stellen bei KITech Software in Hannover: Vertrieb, Entwicklung und Werkstudium. Kleines Team, kurze Wege.",
  path: "/karriere",
  noindex: jobsArePlaceholder,
});

export default function Page() {
  return <Karriere />;
}
