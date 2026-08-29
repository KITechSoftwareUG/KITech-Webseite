import { buildMetadata } from "@/lib/metadata";
import Referenzen from "@/views/Referenzen";
import { empfehlungenFuer } from "@/lib/wissen/empfehlungen";

/**
 * Kein `noindex` mehr: die Übersicht zeigt jetzt sechs echte Fälle mit Zahlen und
 * darf in den Index. Sobald die Seite live ist, gehört `/referenzen` zusätzlich in
 * `src/app/sitemap.ts` — die Datei wird bewusst separat gepflegt.
 */
export const metadata = buildMetadata({
  /* Vom Etikett auf die Begriffe umgestellt (27.08.2026), nach der Linie, die
     /haltung schon nutzt: Ein Titel wie "Referenzen – KITech Software" verbraucht die Haelfte
     der 60 Zeichen fuer den Markennamen, den Google ohnehin daneben anzeigt.
     Die H1 bleibt unberuehrt — sie ist woertliche Vorgabe.
     "Datenmanagement" steht bewusst NICHT drin: Der Begriff kommt im Inhalt
     null Mal vor, und ein Titel, der etwas verspricht, das die Seite nicht
     einloest, kostet mehr als er bringt. */
  title: "KI-Projekte mit Zahlen: Referenzen von KITech Software",
  description:
    "Sechs Kundenfälle mit Zahlen: was gebaut wurde, wie lange es gedauert hat und was es dem Unternehmen seitdem bringt. Auswahl aus über 50 Projekten.",
  path: "/referenzen",
});

export default function Page() {
  return <Referenzen wissen={empfehlungenFuer("/referenzen")} />;
}
