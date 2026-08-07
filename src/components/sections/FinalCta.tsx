"use client";

import { CtaBanner } from "@/components/sections/CtaBanner";

/**
 * Abschluss-CTA der Startseite. Bewusst der letzte Block vor der Fußzeile.
 *
 * Ton: Die Headline ist eine Behauptung über den Leser, keine höfliche Frage.
 * Die frühere Version ("Rechnet sich das für Sie?") hat um Erlaubnis gebeten und
 * gesiezt — beides ist raus. Formulierung stammt wörtlich vom Auftraggeber
 * ("Warum KI bei dir nicht klappt, lass uns reden"), nur von "du" auf "ihr"
 * gedreht, weil die ganze Seite ab dem Hero duzt.
 *
 * Form und Maße kommen aus `CtaBanner` — hier steht nur noch, was drinsteht.
 */
export function FinalCta() {
  return (
    <CtaBanner
      heading="Warum KI bei euch nicht klappt. Lass uns reden."
      text="Ihr habt Tools, ihr habt Lizenzen — und im Tagesgeschäft läuft trotzdem alles wie vorher."
      position="home-final-cta"
    />
  );
}
