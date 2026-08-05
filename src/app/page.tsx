import { buildMetadata } from "@/lib/metadata";
import Home from "@/views/Home";

export const metadata = buildMetadata({
  title: "KITech Software – Anwendungspartner für KI im Mittelstand",
  description:
    "99 % der KI-Projekte scheitern an der falschen KI. Wir sind euer Anwendungspartner und verändern, wie KI in eurem Unternehmen tatsächlich eingesetzt wird. Kostenloses Erstgespräch buchen.",
  path: "/",
});

export default function Page() {
  return <Home />;
}
