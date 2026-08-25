import { buildMetadata } from "@/lib/metadata";
import Referenzen from "@/views/Referenzen";
import { empfehlungenFuer } from "@/lib/wissen/empfehlungen";

/**
 * Kein `noindex` mehr: die Übersicht zeigt jetzt sechs echte Fälle mit Zahlen und
 * darf in den Index. Sobald die Seite live ist, gehört `/referenzen` zusätzlich in
 * `src/app/sitemap.ts` — die Datei wird bewusst separat gepflegt.
 */
export const metadata = buildMetadata({
  title: "Referenzen – KITech Software",
  description:
    "Sechs Kundenfälle mit Zahlen: was gebaut wurde, wie lange es gedauert hat und was es dem Unternehmen seitdem bringt. Auswahl aus über 50 Projekten.",
  path: "/referenzen",
});

export default function Page() {
  return <Referenzen wissen={empfehlungenFuer("/referenzen")} />;
}
