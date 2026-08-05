import UnderConstruction from "@/views/UnderConstruction";

/**
 * Faengt alle unbekannten Pfade ab. Zeigt bewusst die Baustellen-Seite statt einer
 * klassischen 404 — sie bietet Kontaktweg und Referenzen an, statt in eine Sackgasse
 * zu fuehren. Metadata kommt aus dem Root-Layout; not-found darf keine eigene setzen.
 */
export default function NotFound() {
  return <UnderConstruction />;
}
