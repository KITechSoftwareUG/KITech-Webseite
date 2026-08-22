import { buildMetadata } from "@/lib/metadata";
import Haltung from "@/views/Haltung";

export const metadata = buildMetadata({
  title: "Haltung – KITech Software",
  description:
    "Wonach wir entscheiden, wenn es im Projekt eng wird: Sicherheit vor Funktionsumfang, nachvollziehbar statt Blackbox — und ein Nein, wo KI nicht passt.",
  path: "/haltung",
});

export default function Page() {
  return <Haltung />;
}
