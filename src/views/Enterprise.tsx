import { Segment } from "@/views/Segment";
import { enterpriseSegment } from "@/data/segments";
import type { ArtikelTeaser } from "@/lib/wissen/empfehlungen";

/** Zielgruppenseite für Unternehmen. Inhalt in src/data/segments.ts. */
export default function Enterprise({ wissen = [] }: { wissen?: ArtikelTeaser[] }) {
  return <Segment content={enterpriseSegment} wissen={wissen} />;
}
