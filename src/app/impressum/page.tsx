import { buildMetadata } from "@/lib/metadata";
import Impressum from "@/views/Impressum";

export const metadata = buildMetadata({
  title: "Impressum – KITech Software",
  description:
    "Impressum und Anbieterkennzeichnung der KITech Software UG (haftungsbeschränkt), Hannover.",
  path: "/impressum",
});

export default function Page() {
  return <Impressum />;
}
