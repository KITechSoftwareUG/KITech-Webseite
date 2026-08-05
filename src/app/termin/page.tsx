import { buildMetadata } from "@/lib/metadata";
import LassUnsReden from "@/views/LassUnsReden";

/**
 * /termin ist der sprechendere Alias auf dieselbe Seite wie /lass-uns-reden.
 * Das Canonical zeigt deshalb bewusst auf /lass-uns-reden — sonst hätten wir zwei
 * indexierbare URLs mit identischem Inhalt (Duplicate Content).
 */
export const metadata = buildMetadata({
  title: "Termin buchen – KITech Software",
  description:
    "30 Minuten, unverbindlich: Wir schauen uns einen Ihrer Prozesse an und rechnen durch, was Automatisierung dort konkret bringt.",
  path: "/lass-uns-reden",
});

export default function Page() {
  return <LassUnsReden />;
}
