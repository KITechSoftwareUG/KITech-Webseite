import { CalendarClock, FolderOpen, MessagesSquare, type LucideIcon } from "lucide-react";

/**
 * Die drei Bausteine des eingeloggten Bereichs — eine einzige Quelle für
 * Seitenleiste UND Startseiten-Kacheln. Getrennte Listen wären beim ersten
 * Umbenennen auseinandergelaufen, und genau diese Namen sind vom Auftraggeber
 * festgelegt.
 *
 * `contents` beschreibt ausschließlich, was zugesagt ist — keine Termine, keine
 * Zahlen, kein Fortschritt. Der Bereich ist eine Baustelle und wird auch so
 * beschriftet; erfundene Fortschrittsangaben wären an dieser Stelle eine Lüge
 * gegenüber dem eingeloggten Kunden.
 */
export interface AppModule {
  id: string;
  /** Kurzes Label für die Seitenleiste — muss auch bei 248px Breite passen. */
  navLabel: string;
  /** Vollständige Überschrift auf der Kachel. */
  title: string;
  description: string;
  /** Stichpunkte, was der Baustein später enthält. */
  contents: string[];
  icon: LucideIcon;
}

export const appModules: AppModule[] = [
  {
    id: "coaching",
    navLabel: "Sessions",
    title: "1:1-Coaching-Sessions",
    description:
      "Gemeinsame Arbeitssessions an deinem echten Fall — kein Videokurs, den du allein durcharbeitest.",
    contents: ["Terminübersicht", "Session-Historie"],
    icon: CalendarClock,
  },
  {
    id: "community",
    navLabel: "Community",
    title: "Community & Austausch",
    description:
      "Der Ort für Fragen zwischen den Sessions — und für Fälle, die andere schon gelöst haben.",
    contents: ["Fragen stellen", "Echte Fälle teilen"],
    icon: MessagesSquare,
  },
  {
    id: "material",
    navLabel: "Materialien",
    title: "Materialien & Ressourcen",
    description:
      "Alles, was in den Sessions entsteht oder gebraucht wird, an einer Stelle statt verstreut im Postfach.",
    contents: ["Dokumente", "Vorlagen", "Aufzeichnungen"],
    icon: FolderOpen,
  },
];
