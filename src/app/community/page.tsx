import { buildMetadata } from "@/lib/metadata";
import Community from "@/views/Community";

/**
 * Seit dem 05.08.2026 die einzige Community-Route. Der frühere Warteliste-Funnel
 * unter `/skool` ist entfallen und leitet permanent hierher.
 *
 * `noindex`, solange `IM_AUFBAU` in `src/views/Community.tsx` auf `true` steht:
 * die Seite liegt dort hinter Milchglas, und eine verwischte Seite ist für
 * Suchmaschinen dünner Inhalt. Wird der Schalter umgelegt, gehört hier das
 * `noindex` raus und in `src/config/navigation.ts` `indexable` zurück auf `true`.
 */
export const metadata = buildMetadata({
  title: "Die einzig wahre KI-Community – KITech Software",
  description:
    "Kein Hype. Keine Demos. Nur echte Projekte mit echten Ergebnissen. Die Community startet am 1. September 2026.",
  path: "/community",
  // Vorschaubild aus dem früheren Skool-Funnel: 16:9, Aussage plus Skool-Logo.
  ogImage: "/media/skool-og.jpg",
  noindex: true,
});

export default function Page() {
  return <Community />;
}
