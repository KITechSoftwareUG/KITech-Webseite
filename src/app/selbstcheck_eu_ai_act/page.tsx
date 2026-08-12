import { buildMetadata } from "@/lib/metadata";
import EuAiActSelbstcheck from "@/views/EuAiActSelbstcheck";

/**
 * Markenfreie Einzelseite, die ausserhalb der Website eingesetzt wird.
 *
 * `ogImage: null` überlässt das Vorschaubild der Datei `opengraph-image.tsx` in
 * diesem Ordner — das Standardbild von `buildMetadata` ist das KITech-Logo und
 * wäre beim Teilen genau die Marke, die hier nicht auftauchen soll.
 *
 * `noindex`, weil die Seite auf Ansage nirgends zur Website gehört: sie steht in
 * keiner Navigation, in keiner Sitemap und soll auch nicht über die Suche als
 * Unterseite von kitech-software.de gefunden werden. Wer sie aufruft, hat die
 * Adresse von woanders.
 */
export const metadata = buildMetadata({
  title: "EU-AI-Act-Selbstcheck – acht Fragen, Ergebnis sofort",
  description:
    "Prüfen Sie in wenigen Minuten, welche Pflichten der EU AI Act für Ihren KI-Einsatz mit sich bringt.",
  path: "/selbstcheck_eu_ai_act",
  ogImage: null,
  siteName: null,
  noindex: true,
});

export default function Page() {
  return <EuAiActSelbstcheck />;
}
