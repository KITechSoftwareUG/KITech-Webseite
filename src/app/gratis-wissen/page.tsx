import { buildMetadata } from "@/lib/metadata";
import GratisWissen from "@/views/GratisWissen";

export const metadata = buildMetadata({
  title: "Gratis-Wissen: KI-Tipps, Ratgeber und häufige Fehler – KITech Software",
  description:
    "Artikel und Ratgeber zu KI im Mittelstand: die häufigsten Fehler, die Wahl zwischen AWS, Azure und eigenem Server, und was ein KI-Setup im Betrieb wirklich ausmacht. Kostenlos, ohne Anmeldung.",
  path: "/gratis-wissen",
});

export default function Page() {
  return <GratisWissen />;
}
