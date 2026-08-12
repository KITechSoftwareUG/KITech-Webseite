import { buildMetadata } from "@/lib/metadata";
import EuAiActSelbstcheck from "@/views/EuAiActSelbstcheck";

/**
 * Markenfreie Seite: kein Firmenname im Titel, kein Logo als Vorschaubild.
 * `ogImage: null` überlässt das Bild der Datei `opengraph-image.tsx` in diesem
 * Ordner — das Standardbild von `buildMetadata` ist das KITech-Logo und wäre
 * beim Teilen genau die Marke, die hier nicht auftauchen soll.
 */
export const metadata = buildMetadata({
  title: "EU-AI-Act-Selbstcheck – acht Fragen, Ergebnis sofort",
  description:
    "Prüfen Sie in wenigen Minuten, welche Pflichten der EU AI Act für Ihren KI-Einsatz mit sich bringt.",
  path: "/selbstcheck_eu_ai_act",
  ogImage: null,
  siteName: null,
});

export default function Page() {
  return <EuAiActSelbstcheck />;
}
