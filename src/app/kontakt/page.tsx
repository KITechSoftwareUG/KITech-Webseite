import { buildMetadata } from "@/lib/metadata";
import Kontakt from "@/views/Kontakt";

export const metadata = buildMetadata({
  /* Vom Etikett auf die Begriffe umgestellt (27.08.2026), nach der Linie, die
     /haltung schon nutzt: Ein Titel wie "Kontakt – KITech Software" verbraucht die Haelfte
     der 60 Zeichen fuer den Markennamen, den Google ohnehin daneben anzeigt.
     Die H1 bleibt unberuehrt — sie ist woertliche Vorgabe.
     "Datenmanagement" steht bewusst NICHT drin: Der Begriff kommt im Inhalt
     null Mal vor, und ein Titel, der etwas verspricht, das die Seite nicht
     einloest, kostet mehr als er bringt. */
  title: "KI-Beratung Hannover – Kontakt zu KITech Software",
  description:
    "1:1-KI-Check im Kalender sichern, schreiben oder anrufen. KITech Software, Hannover — ohne Formularschleife.",
  path: "/kontakt",
});

export default function Page() {
  return <Kontakt />;
}
