import { buildMetadata } from "@/lib/metadata";
import Warum from "@/views/Warum";

/**
 * Ziel des Navigationspunkts "Warum?", unter dem die beiden Sales Letter hängen.
 *
 * Indexierbar, obwohl die beiden verlinkten Letter selbst auf `noindex` stehen:
 * diese Seite trägt eigenen, fertigen Text — die Letter tragen noch Platzhalter.
 */
export const metadata = buildMetadata({
  title: "Warum KI bei den meisten kein Geld verdient – KITech Software",
  description:
    "Nicht die Technik ist das Problem. Zwei Wege zur selben Ursache: einer für Selbstständige, einer für Unternehmen.",
  path: "/warum",
});

export default function Page() {
  return <Warum />;
}
