import { buildMetadata } from "@/lib/metadata";
import WarumDuKeinGeld from "@/views/WarumDuKeinGeld";

// noindex, solange der Sales Letter nur Platzhaltertext enthaelt
// (siehe isPlaceholder in src/data/sales-letters.ts).
export const metadata = buildMetadata({
  title: "Warum du mit KI kein Geld verdienst – KITech Software",
  description:
    "Platzhalter-Beschreibung: Der ehrliche Grund, warum die meisten mit KI keinen Cent verdienen — und was stattdessen funktioniert.",
  path: "/warum-du-mit-ki-kein-geld-verdienst",
  noindex: true,
});

export default function Page() {
  return <WarumDuKeinGeld />;
}
