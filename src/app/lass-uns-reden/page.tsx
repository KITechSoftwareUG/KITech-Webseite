import { buildMetadata } from "@/lib/metadata";
import LassUnsReden from "@/views/LassUnsReden";

export const metadata = buildMetadata({
  title: "Lass uns reden – Erstgespräch mit KITech Software",
  description:
    "30 Minuten, unverbindlich: Wir schauen uns einen Ihrer Prozesse an und rechnen durch, was Automatisierung dort konkret bringt.",
  path: "/lass-uns-reden",
});

export default function Page() {
  return <LassUnsReden />;
}
