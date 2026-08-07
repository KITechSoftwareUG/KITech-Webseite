import { buildMetadata } from "@/lib/metadata";
import Leistungen from "@/views/Leistungen";

/**
 * Stand bis zum 05.08.2026 auf der Baustellenseite mit `noindex`, obwohl die
 * Alt-Seite den Inhalt hatte. Jetzt wieder eine echte Seite — und damit auch
 * wieder indexierbar.
 */
export const metadata = buildMetadata({
  title: "Leistungen – KITech Software",
  description:
    "Vom Prozess-Audit über individuelle KI-Agenten und Datenplattform bis zum laufenden Betrieb. Sechs Schritte für den deutschen Mittelstand.",
  path: "/leistungen",
});

export default function Page() {
  return <Leistungen />;
}
