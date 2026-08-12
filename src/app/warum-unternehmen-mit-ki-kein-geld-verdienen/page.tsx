import { buildMetadata } from "@/lib/metadata";
import { unternehmenLetter } from "@/data/sales-letters";
import WarumUnternehmenKeinGeld from "@/views/WarumUnternehmenKeinGeld";

/** Siehe Schwesterroute: Metadaten aus der Datendatei, `noindex` an `isPlaceholder`. */
export const metadata = buildMetadata({
  title: unternehmenLetter.seo.title,
  description: unternehmenLetter.seo.description,
  path: `/${unternehmenLetter.slug}`,
  noindex: Boolean(unternehmenLetter.isPlaceholder),
});

export default function Page() {
  return <WarumUnternehmenKeinGeld />;
}
