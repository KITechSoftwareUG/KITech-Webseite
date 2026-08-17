import { buildMetadata } from "@/lib/metadata";
import AGB from "@/views/AGB";

export const metadata = buildMetadata({
  title: "AGB – KITech Software",
  description:
    "Allgemeine Geschäftsbedingungen von KITech Software.",
  path: "/agb",
});

export default function Page() {
  return <AGB />;
}
