import { SalesLetter } from "@/components/sections/SalesLetter";
import { unternehmenLetter } from "@/data/sales-letters";

/** Funnel-Seite für Unternehmen. Inhalt in src/data/sales-letters.ts. */
export default function WarumUnternehmenKeinGeld() {
  return <SalesLetter content={unternehmenLetter} />;
}
