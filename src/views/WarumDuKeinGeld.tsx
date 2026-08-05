import { SalesLetter } from "@/components/sections/SalesLetter";
import { soloLetter } from "@/data/sales-letters";

/** Funnel-Seite für Einzelunternehmer. Inhalt in src/data/sales-letters.ts. */
export default function WarumDuKeinGeld() {
  return <SalesLetter content={soloLetter} />;
}
