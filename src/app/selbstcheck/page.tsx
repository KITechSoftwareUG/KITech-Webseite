import { buildMetadata } from "@/lib/metadata";
import EuAiActSelbstcheck from "@/views/EuAiActSelbstcheck";

/**
 * /selbstcheck ist der Kurz-Alias auf /eu-ai-act-selbstcheck. Canonical zeigt
 * bewusst auf die Langform, damit nicht zwei identische URLs im Index landen.
 */
export const metadata = buildMetadata({
  title: "EU-AI-Act-Selbstcheck – acht Fragen, Ergebnis sofort",
  description:
    "Prüfen Sie in wenigen Minuten, welche Pflichten der EU AI Act für Ihren KI-Einsatz mit sich bringt.",
  path: "/eu-ai-act-selbstcheck",
  // Markenfrei wie die Langform — Begründung dort.
  ogImage: null,
  siteName: null,
});

export default function Page() {
  return <EuAiActSelbstcheck />;
}
