import { buildMetadata } from "@/lib/metadata";
import Enterprise from "@/views/Enterprise";
import { empfehlungenFuer } from "@/lib/wissen/empfehlungen";

/**
 * Stand bis zum 05.08.2026 auf der Baustellenseite. Jetzt wieder eine echte
 * Seite — verdichtet aus der Alt-Seite, Inhalt in `src/data/segments.ts`.
 */
export const metadata = buildMetadata({
  /* Vom Etikett auf die Begriffe umgestellt (27.08.2026), nach der Linie, die
     /haltung schon nutzt: Ein Titel wie "KI für Unternehmen – KITech Software" verbraucht die Haelfte
     der 60 Zeichen fuer den Markennamen, den Google ohnehin daneben anzeigt.
     Die H1 bleibt unberuehrt — sie ist woertliche Vorgabe.
     "Datenmanagement" steht bewusst NICHT drin: Der Begriff kommt im Inhalt
     null Mal vor, und ein Titel, der etwas verspricht, das die Seite nicht
     einloest, kostet mehr als er bringt. */
  title: "KI-Software für Unternehmen: Audit, Umsetzung, Betrieb",
  description:
    "Für Unternehmen mit gewachsenen Prozessen und echten Compliance-Anforderungen: Audit, Business Case, Umsetzung gegen feste Ziele und laufender Nachweis.",
  path: "/enterprise",
});

export default function Page() {
  return <Enterprise wissen={empfehlungenFuer("/enterprise")} />;
}
