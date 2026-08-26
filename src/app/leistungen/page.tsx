import { buildMetadata } from "@/lib/metadata";
import Leistungen from "@/views/Leistungen";
import { empfehlungenFuer } from "@/lib/wissen/empfehlungen";

/**
 * Stand bis zum 05.08.2026 auf der Baustellenseite mit `noindex`, obwohl die
 * Alt-Seite den Inhalt hatte. Jetzt wieder eine echte Seite — und damit auch
 * wieder indexierbar.
 */
/*
 * Titel am 26.08.2026 vom Etikett auf den Suchbegriff umgestellt. "Leistungen"
 * sucht niemand; der Zielbegriff aus dem gepflegten Themen-Vorrat lautet
 * "prozesse automatisieren unternehmen". Der Zusatz "– KITech Software"
 * entfaellt, weil er sonst ueber TITEL_MAX ginge -- dieselbe Entscheidung wie
 * am 20.08.2026 fuer Artikel-, Autoren- und Hub-Seiten.
 *
 * Die Beschreibung nannte "Sechs Schritte" und eine "Datenplattform". Beides
 * stimmt seit dem 12.08.2026 nicht mehr: services.ts fuehrt vier Schritte, und
 * die H1 der Seite sagt "Vier Schritte. In dieser Reihenfolge."
 */
export const metadata = buildMetadata({
  title: "Prozesse automatisieren: Audit, KI-Agenten, Betrieb",
  description:
    "Vom Prozess-Audit über KI-Agenten an euren Daten bis zu Betrieb und Wartung – auf AWS, Azure oder eigener Hardware. Vier Schritte für den Mittelstand.",
  path: "/leistungen",
});

export default function Page() {
  return <Leistungen wissen={empfehlungenFuer("/leistungen")} />;
}
