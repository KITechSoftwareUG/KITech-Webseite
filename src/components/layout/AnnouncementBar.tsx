"use client";

import Link from "next/link";
import { announcement } from "@/config/announcement";
import { trackEvent } from "@/lib/plausible";

/**
 * Dunkelblauer Ankuendigungsbalken ganz oben — die einzige Leiste, die beim
 * Scrollen stehen bleibt.
 *
 * Das ist der Kern der Vorgabe: Balken `fixed`, Navigationsleiste darunter
 * laeuft normal im Dokumentfluss mit und verschwindet dadurch beim Scrollen.
 * Umgekehrt waere es die uebliche Sticky-Navigation — hier ausdruecklich nicht
 * gewollt.
 *
 * Die Hoehe steht als Konstante hier und wird von `PageShell` als oberer
 * Abstand des Seiteninhalts wiederverwendet. Ohne diesen Abstand laege die
 * Kopfzeile unter dem fixierten Balken.
 *
 * Inhalt kommt aus `src/config/announcement.ts`; steht dort `null`, rendert
 * diese Komponente nichts und `ANNOUNCEMENT_HEIGHT` wird zu 0 (siehe
 * `announcementSpacerClass`).
 */

/** Hoehe des Balkens in Pixeln, mobil und ab `sm`. */
export const ANNOUNCEMENT_HEIGHT = { mobil: 56, desktop: 68 };

/**
 * Oberer Abstand, den der Seiteninhalt braucht, damit er nicht unter dem
 * fixierten Balken beginnt. Leerer String, wenn es keinen Balken gibt.
 */
export const announcementSpacerClass = announcement ? "pt-[56px] sm:pt-[68px]" : "";

export function AnnouncementBar() {
  if (!announcement) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-primary text-primary-foreground">
      <Link
        href={announcement.href}
        onClick={() => trackEvent("CTA_Klick", { position: "ankuendigungsbalken" })}
        className="mx-auto flex h-[56px] max-w-site items-center justify-center gap-2.5 px-4 text-center transition-opacity hover:opacity-90 sm:h-[68px] sm:gap-3"
      >
        {/* Die Pille steht auch mobil: ohne sie und ohne den Pfeil wirkt der
            Balken dort wie eine versehentlich stehengebliebene Textzeile. */}
        {announcement.badge && (
          <span className="shrink-0 rounded-full bg-white px-[7px] py-[3px] text-[11px] font-bold leading-[16px] text-black sm:text-[13px] sm:leading-[18px]">
            {announcement.badge}
          </span>
        )}

        {/* Mobil traegt nur der fette Teil; der Zusatz wuerde die Zeile
            sprengen. Ab sm steht sie einzeilig wie in der Vorlage. */}
        <span className="text-[13px] leading-tight sm:text-[15px] sm:font-light sm:leading-[19.5px]">
          <strong className="font-bold sm:text-[18px] sm:leading-[19.5px]">
            {announcement.lead}
          </strong>
          {/* Doppelpunkt gehoert zum ausgeblendeten Teil: mobil steht sonst
              "Kostenloses Erstgespraech:" mit einem Doppelpunkt ins Leere. */}
          <span className="hidden sm:inline">: {announcement.text}</span>
        </span>

        {/* Der lange Pfeil ist ein Erkennungszeichen der Vorlage. Als SVG statt
            als Unicode-Pfeil, weil "⟶" je nach Schrift unterschiedlich lang
            gerendert wird. Mobil kuerzer, damit die Zeile nicht umbricht. */}
        <svg
          className="h-[9px] w-[22px] shrink-0 sm:h-[10px] sm:w-[34px]"
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
      </Link>
    </div>
  );
}
