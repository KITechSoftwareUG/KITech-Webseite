"use client";

import Link from "next/link";
import { announcement } from "@/config/announcement";
import { trackEvent } from "@/lib/plausible";

/**
 * Ankuendigungsbalken ganz oben — die einzige Leiste, die beim Scrollen stehen
 * bleibt.
 *
 * Das ist der Kern der Vorgabe: Balken `fixed`, Navigationsleiste darunter
 * laeuft normal im Dokumentfluss mit und verschwindet dadurch beim Scrollen.
 * Umgekehrt waere es die uebliche Sticky-Navigation — hier ausdruecklich nicht
 * gewollt.
 *
 * Maße aus der Vorlage gemessen:
 *   Hoehe        68 px einzeilig (Desktop), 87 px zweizeilig (Handy)
 *   Text         18 px / 700 (fett) + 15 px / 300 (leicht)
 *   Badge        13 px / 700, weiss auf Signalfarbe, Radius 50 px, Padding 3/7
 *   Pfeil        langer Strich mit Spitze, rund 34 px breit
 *
 * Die Hoehe entsteht ueber `py`, nicht ueber eine feste Hoehe: mobil bricht die
 * Zeile um und der Balken waechst mit, statt den Text abzuschneiden. 22 px
 * Innenabstand plus 24 px Zeilenhoehe ergeben die gemessenen 68 px.
 *
 * Inhalt kommt aus `src/config/announcement.ts`; steht dort `null`, rendert
 * diese Komponente nichts und `announcementSpacerClass` wird leer.
 */

/**
 * Oberer Abstand, den der Seiteninhalt braucht, damit er nicht unter dem
 * fixierten Balken beginnt. Entspricht den gemessenen Hoehen der Vorlage.
 */
export const announcementSpacerClass = announcement ? "pt-[87px] sm:pt-[68px]" : "";

export function AnnouncementBar() {
  if (!announcement) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-primary text-primary-foreground">
      <Link
        href={announcement.href}
        onClick={() => trackEvent("CTA_Klick", { position: "ankuendigungsbalken" })}
        className="mx-auto flex min-h-[87px] max-w-site items-center justify-center px-[10px] py-[22px] text-center text-[15px] font-light leading-[19.5px] transition-opacity hover:opacity-90 sm:min-h-[68px] dt:px-0"
      >
        {/*
          Pille, Text und Pfeil stehen im selben Textfluss (inline), nicht als
          starre Flex-Geschwister. Genau so macht es die Vorlage — und nur so
          bricht die Zeile auf schmalen Displays auf ZWEI Zeilen um statt auf
          drei: als Flex-Element haetten Pille und Pfeil ihre Breite reserviert
          und dem Text die Spalte weggenommen.
        */}
        <span>
          {announcement.badge && (
            <span className="mr-3 inline-block whitespace-nowrap rounded-[50px] bg-white px-[7px] py-[3px] align-middle text-[13px] font-bold leading-[18px] text-black">
              {announcement.badge}
            </span>
          )}
          <strong className="text-[18px] font-bold leading-[19.5px]">{announcement.lead}:</strong>{" "}
          {announcement.text}{" "}
          {/* Der lange Pfeil ist ein Erkennungszeichen der Vorlage. Als SVG statt
              als Unicode-Pfeil, weil "⟶" je nach Schrift unterschiedlich lang
              gerendert wird. */}
          <svg
            className="ml-1 inline-block h-[10px] w-[34px] align-middle"
            viewBox="0 0 34 10"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 5h31M27 1l5 4-5 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>
    </div>
  );
}
