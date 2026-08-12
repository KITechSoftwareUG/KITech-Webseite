import { buildMetadata } from "@/lib/metadata";
import { Funnel } from "@/views/Funnel";

/**
 * LinkedIn-Landingpage für den kostenlosen Live-Workshop, erreichbar unter
 * funnel.kitech-software.de (Host-Rewrite in src/proxy.ts) und intern unter
 * /funnel.
 *
 * `noindex`, solange die drei offenen Punkte aus src/data/funnel.ts stehen:
 * kein Termin eingetragen, Pattern-Interrupt ist Platzhaltertext, und die
 * Anmeldung führt auf den allgemeinen Kalender statt auf einen Workshop-Platz.
 * Eine Seite, die einen Termin bewirbt, den sie nicht nennt, gehört nicht in
 * den Suchindex.
 */
export const metadata = buildMetadata({
  title: "Warum du mit KI keinen Umsatz machst – kostenloser Workshop",
  description:
    "Kostenloser Live-Workshop für Geschäftsführer im Mittelstand: die fünf Stellen, an denen aus KI Umsatz wird — und warum die meisten Betriebe an keiner davon ansetzen.",
  path: "/funnel",
  ogImage: "https://kitech-software.de/images/og/funnel.png",
  noindex: true,
});

export default function Page() {
  return <Funnel />;
}
