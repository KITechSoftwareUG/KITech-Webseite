import { buildMetadata } from "@/lib/metadata";
import WarumUnternehmenKeinGeld from "@/views/WarumUnternehmenKeinGeld";

// noindex, solange der Sales Letter nur Platzhaltertext enthaelt
// (siehe isPlaceholder in src/data/sales-letters.ts).
export const metadata = buildMetadata({
  title: "Warum Unternehmen mit KI kein Geld verdienen – KITech Software",
  description:
    "Platzhalter-Beschreibung: Warum KI-Projekte im Mittelstand im Pilotstadium sterben — und woran man es vorher erkennt.",
  path: "/warum-unternehmen-mit-ki-kein-geld-verdienen",
  noindex: true,
});

export default function Page() {
  return <WarumUnternehmenKeinGeld />;
}
