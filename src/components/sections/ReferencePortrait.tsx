import type { ClientResult } from "@/data/client-results";

/**
 * Portrait einer Kundenperson als freigestellte Silhouette — bewusst OHNE Rahmen
 * und ohne Hintergrundfläche. Ein Kasten drumherum ließe das Foto wie einen
 * Ausweis wirken; so steht die Person frei im Layout. Die Tiefe kommt aus dem
 * Schlagschatten statt aus einem Rahmen.
 *
 * Der Schatten ist mit dem hellen Design (11.08.2026) deutlich zurückgenommen und
 * in den Navy-Ton der Seite gedreht. Der frühere harte Schwarzschatten war für den
 * dunklen Grund gebaut; auf Weiß legt er einen grauen Schleier um die Person.
 *
 * Liegt kein Foto vor, wird **nichts** gerendert (`null`). Eine Initialen-Kachel
 * als Ersatz wäre nur ein leerer Kasten — die aufrufende Seite prüft deshalb
 * selbst auf `person.photo` und passt ihr Layout an.
 *
 * `portrait-fade` (src/index.css) blendet den unteren Bildrand aus: die Freisteller
 * enden am Brustkorb, ohne den Verlauf sähe jede Person aus, als hätte man sie
 * abgeschnitten. Gilt bewusst an allen Einsatzorten gleich.
 */
export function ReferencePortrait({
  person,
  className = "",
  imageClassName = "h-[150px]",
}: {
  person: ClientResult["person"];
  className?: string;
  /**
   * Höhe der Silhouette — je nach Einsatzort unterschiedlich. Sie muss zur Breite
   * im `className` passen: das Bild wird per object-contain eingepasst und unten
   * ausgerichtet, eine zu große Höhe erzeugt also nur Leerraum darüber.
   */
  imageClassName?: string;
}) {
  if (!person.photo) return null;

  return (
    <div className={className}>
      <img
        src={person.photo}
        alt={`${person.name}${person.role ? `, ${person.role}` : ""}`}
        className={`portrait-fade w-full object-contain object-bottom drop-shadow-[0_16px_28px_rgba(0,0,0,0.6)] ${imageClassName}`}
        loading="lazy"
      />
    </div>
  );
}
