import { buildMetadata } from "@/lib/metadata";
import EuAiActSelbstcheck from "@/views/EuAiActSelbstcheck";

export const metadata = buildMetadata({
  title: "EU-AI-Act-Selbstcheck – KITech Software",
  description:
    "Prüfen Sie in wenigen Minuten, welche Pflichten der EU AI Act für Ihren KI-Einsatz mit sich bringt.",
  path: "/eu-ai-act-selbstcheck",
});

export default function Page() {
  return <EuAiActSelbstcheck />;
}
