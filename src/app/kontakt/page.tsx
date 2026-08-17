import { buildMetadata } from "@/lib/metadata";
import Kontakt from "@/views/Kontakt";

export const metadata = buildMetadata({
  title: "Kontakt – KITech Software",
  description:
    "1:1-KI-Check im Kalender sichern, schreiben oder anrufen. KITech Software, Hannover — ohne Formularschleife.",
  path: "/kontakt",
});

export default function Page() {
  return <Kontakt />;
}
