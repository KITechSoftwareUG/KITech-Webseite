import { buildMetadata } from "@/lib/metadata";
import AGB from "@/views/AGB";

export const metadata = buildMetadata({
  title: "AGB – KITech Software",
  description:
    "Allgemeine Geschäftsbedingungen der KITech Software UG (haftungsbeschränkt).",
  path: "/agb",
});

export default function Page() {
  return <AGB />;
}
