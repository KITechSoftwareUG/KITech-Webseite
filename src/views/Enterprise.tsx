import { Segment } from "@/views/Segment";
import { enterpriseSegment } from "@/data/segments";

/** Zielgruppenseite für Unternehmen. Inhalt in src/data/segments.ts. */
export default function Enterprise() {
  return <Segment content={enterpriseSegment} />;
}
