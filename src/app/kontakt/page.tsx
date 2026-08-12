import { buildMetadata } from "@/lib/metadata";
import Kontakt from "@/views/Kontakt";

export const metadata = buildMetadata({
  title: "Kontakt – KITech Software",
  description:
    "KI-Bewertung im Kalender sichern, schreiben oder anrufen. KITech Software UG, Hannover — ohne Formularschleife.",
  path: "/kontakt",
});

export default function Page() {
  return <Kontakt />;
}
