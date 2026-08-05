import { buildMetadata } from "@/lib/metadata";
import Datenschutz from "@/views/Datenschutz";

export const metadata = buildMetadata({
  title: "Datenschutzerklärung – KITech Software",
  description:
    "Wie KITech Software personenbezogene Daten verarbeitet: Analytics, Kontaktaufnahme, Ihre Rechte.",
  path: "/datenschutz",
});

export default function Page() {
  return <Datenschutz />;
}
