import { buildMetadata } from "@/lib/metadata";
import Enterprise from "@/views/Enterprise";
import { empfehlungenFuer } from "@/lib/wissen/empfehlungen";

/**
 * Stand bis zum 05.08.2026 auf der Baustellenseite. Jetzt wieder eine echte
 * Seite — verdichtet aus der Alt-Seite, Inhalt in `src/data/segments.ts`.
 */
export const metadata = buildMetadata({
  title: "KI für Unternehmen – KITech Software",
  description:
    "Für Unternehmen mit gewachsenen Prozessen und echten Compliance-Anforderungen: Audit, Business Case, Umsetzung gegen feste Ziele und laufender Nachweis.",
  path: "/enterprise",
});

export default function Page() {
  return <Enterprise wissen={empfehlungenFuer("/enterprise")} />;
}
