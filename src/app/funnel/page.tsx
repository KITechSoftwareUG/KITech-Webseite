import { buildMetadata } from "@/lib/metadata";
import { Funnel } from "@/views/Funnel";

/**
 * LinkedIn-"Featured"-Landingpage, erreichbar unter funnel.kitech-software.de
 * (Host-Rewrite in src/proxy.ts) und intern unter /funnel. noindex, solange
 * Pattern-Interrupt-Text Platzhalter ist (siehe src/data/funnel.ts).
 */
export const metadata = buildMetadata({
  title: "KI-Infrastruktur für Unternehmen – KITech Software",
  description:
    "KI wird erst produktiv, wenn sie auf relevante Unternehmensdaten, Systeme und Prozesse zugreifen kann.",
  path: "/funnel",
  noindex: true,
});

export default function Page() {
  return <Funnel />;
}
