"use client";

import { CtaBanner } from "@/components/sections/CtaBanner";

/**
 * Abschluss-CTA der Referenz-Seiten.
 *
 * Ton: Headline nach der wörtlichen Vorgabe des Auftraggebers ("warum in deinem
 * Unternehmen KI dir keinen Umsatz bringen würde"), auf "ihr" gedreht und im
 * Indikativ statt Konjunktiv — "bringt" behauptet, "bringen würde" relativiert.
 * Der Text steht direkt hinter den Kundenfällen und dreht sie bewusst um: dort
 * hat es funktioniert, hier ist der Grund, warum bei euch nicht.
 *
 * Bewusst anderer Text als in `FinalCta`: wer von der Startseite über die
 * Referenzen läuft, soll nicht denselben Block zweimal lesen. Die eigene
 * `position` hält außerdem in der Auswertung auseinander, von welcher Seite die
 * Buchung kam.
 */
export function ReferenceCta({ position }: { position: string }) {
  return (
    <CtaBanner
      heading="Warum KI in eurem Unternehmen keinen Umsatz bringt."
      text="Nicht weil die Technik fehlt, sondern weil niemand den Prozess dahinter anfasst."
      position={position}
    />
  );
}
