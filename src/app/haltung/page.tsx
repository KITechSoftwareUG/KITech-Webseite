import { buildMetadata } from "@/lib/metadata";
import Haltung from "@/views/Haltung";
import { empfehlungenFuer } from "@/lib/wissen/empfehlungen";

export const metadata = buildMetadata({
  /* Am 26.08.2026 vom Etikett auf die drei Punkte umgestellt, nach denen jemand
     tatsaechlich sucht, wenn er einen Dienstleister prueft. Alle drei stehen
     woertlich auf der Seite (principles und commitments in data/principles.ts).
     "Haltung" bleibt vorn, weil es der Navigationspunkt ist. Die H1 ist woertliche
     Vorgabe und wird nicht in den Titel gezogen. */
  title: "Haltung: Datenschutz, kein Lock-in, wartbare Systeme",
  description:
    "Wonach wir entscheiden, wenn es im Projekt eng wird: Sicherheit vor Funktionsumfang, nachvollziehbar statt Blackbox — und ein Nein, wo KI nicht passt.",
  path: "/haltung",
});

export default function Page() {
  return <Haltung wissen={empfehlungenFuer("/haltung")} />;
}
