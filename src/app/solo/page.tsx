import { buildMetadata } from "@/lib/metadata";
import Solo from "@/views/Solo";
import { empfehlungenFuer } from "@/lib/wissen/empfehlungen";

/**
 * Stand bis zum 05.08.2026 auf der Baustellenseite. Jetzt wieder eine echte
 * Seite — verdichtet aus der Alt-Seite, Inhalt in `src/data/segments.ts`.
 */
export const metadata = buildMetadata({
  title: "KI für Selbstständige – KITech Software",
  description:
    "Für Selbstständige und Teams bis sechs Leute: KI im Alltag nutzen statt sie nur zu abonnieren. Gebaut an deinen echten Fällen, dann selbst weiterführbar.",
  path: "/solo",
});

export default function Page() {
  return <Solo wissen={empfehlungenFuer("/solo")} />;
}
