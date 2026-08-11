import { buildMetadata } from "@/lib/metadata";
import { Fokus } from "@/views/Fokus";

/**
 * LinkedIn-"Featured"-Landingpage, erreichbar unter fokus.kitech-software.de
 * (Host-Rewrite in src/proxy.ts) und intern unter /fokus. noindex, solange
 * Pattern-Interrupt-Text Platzhalter ist (siehe src/data/fokus.ts).
 */
export const metadata = buildMetadata({
  title: "1:1-KI-Workshop – KITech Software",
  description:
    "Keine weiteren Tutorials. Kein weiterer Prompt-Ordner. Sondern ein konkreter Plan für deine Situation.",
  path: "/fokus",
  noindex: true,
});

export default function Page() {
  return <Fokus />;
}
