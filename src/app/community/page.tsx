import { buildMetadata } from "@/lib/metadata";
import Community from "@/views/Community";

/**
 * Seit dem 05.08.2026 die einzige Community-Route. Der frühere Warteliste-Funnel
 * unter `/skool` ist entfallen und leitet permanent hierher.
 *
 * Kein `noindex` mehr: die Seite hat echten Inhalt und soll gefunden werden.
 */
export const metadata = buildMetadata({
  title: "Die einzig wahre KI-Community – KITech Software",
  description:
    "Kein Hype. Keine Demos. Nur echte Projekte mit echten Ergebnissen. Kostenlos beitreten — die Plätze sind begrenzt.",
  path: "/community",
  // Vorschaubild aus dem früheren Skool-Funnel: 16:9, Aussage plus Skool-Logo.
  ogImage: "/media/skool-og.jpg",
});

export default function Page() {
  return <Community />;
}
