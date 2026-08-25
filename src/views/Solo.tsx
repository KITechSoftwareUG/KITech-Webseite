import { Segment } from "@/views/Segment";
import { soloSegment } from "@/data/segments";
import type { ArtikelTeaser } from "@/lib/wissen/empfehlungen";

/** Zielgruppenseite für Selbstständige. Inhalt in src/data/segments.ts. */
export default function Solo({ wissen = [] }: { wissen?: ArtikelTeaser[] }) {
  return <Segment content={soloSegment} wissen={wissen} />;
}
