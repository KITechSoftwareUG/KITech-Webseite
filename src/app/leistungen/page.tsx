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
 * stimmt seit dem 12.08.2026 nicht mehr.
 *
 * ⚠️ Die Zahl der Schritte gehoert NICHT in die Beschreibung. Sie stand hier
 * als "Vier Schritte" und war am 04.09.2026 schon wieder falsch, weil
 * services.ts auf fuenf gewachsen ist — eine Angabe, die bei jeder
 * Inhaltsaenderung veraltet und die niemand sucht. Stattdessen stehen dort
 * jetzt die Produktnamen, nach denen tatsaechlich gesucht wird.
 */
export const metadata = buildMetadata({
  title: "Prozesse automatisieren: Power Automate, KI, Betrieb",
  description:
    "Vom Prozess-Audit über Power Automate, Power BI und Dynamics 365 bis zu Betrieb und Wartung – in eurer Microsoft-Umgebung oder auf eigener Hardware.",
  path: "/leistungen",
});

export default function Page() {
  return <Leistungen wissen={empfehlungenFuer("/leistungen")} />;
}
