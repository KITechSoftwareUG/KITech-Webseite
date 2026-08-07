import { Segment } from "@/views/Segment";
import { soloSegment } from "@/data/segments";

/** Zielgruppenseite für Selbstständige. Inhalt in src/data/segments.ts. */
export default function Solo() {
  return <Segment content={soloSegment} />;
}
