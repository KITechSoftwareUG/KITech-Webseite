import { buildMetadata } from "@/lib/metadata";
import { soloLetter } from "@/data/sales-letters";
import WarumDuKeinGeld from "@/views/WarumDuKeinGeld";

/**
 * Titel und Beschreibung kommen aus der Datendatei, nicht aus dieser Zeile:
 * Vorher standen sie hier ein zweites Mal, und nachdem der Text ausgeschrieben
 * war, stand in der Suchvorschau weiter "Platzhalter-Beschreibung: …".
 *
 * `noindex` bleibt, solange `isPlaceholder` in `src/data/sales-letters.ts`
 * gesetzt ist — der Text ist ausgeschrieben, aber nicht von Ayham freigegeben.
 */
export const metadata = buildMetadata({
  title: soloLetter.seo.title,
  description: soloLetter.seo.description,
  path: `/${soloLetter.slug}`,
  noindex: Boolean(soloLetter.isPlaceholder),
});

export default function Page() {
  return <WarumDuKeinGeld />;
}
