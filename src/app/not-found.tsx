import NichtGefunden from "@/views/NichtGefunden";

/**
 * Fängt alle unbekannten Pfade ab.
 *
 * Zeigte bis zum 05.08.2026 die Baustellenseite — die stammte aus der
 * Relaunch-Phase, in der jede Route dorthin führte, und behauptete nach dem
 * Relaunch fälschlich, die Website sei im Umbau. Jetzt eine echte 404 mit der
 * vollständigen Navigation.
 *
 * Metadata kommt aus dem Root-Layout; `not-found` darf keine eigene setzen.
 */
export default function NotFound() {
  return <NichtGefunden />;
}
