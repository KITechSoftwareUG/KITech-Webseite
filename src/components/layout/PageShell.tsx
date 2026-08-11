"use client";

import type { ReactNode } from "react";
import { AnnouncementBar, announcementSpacerClass } from "./AnnouncementBar";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/**
 * Gemeinsamer Rahmen aller Seiten:
 *
 *   Ankuendigungsbalken (dunkelblau, bleibt beim Scrollen stehen)
 *   Navigationsleiste   (Navy, scrollt weg)
 *   Inhalt
 *   Fusszeile           (dunkelblau)
 *
 * Der obere Abstand (`announcementSpacerClass`) haelt den Platz frei, den der
 * fixierte Balken einnimmt. Ohne ihn laege die Navigationsleiste darunter.
 *
 * Der frueher hier eingehaengte `SignalBackdrop` (dunkler Verlauf plus
 * Canvas-Signalfeld) ist mit dem Wechsel auf das helle Design entfallen. Der
 * Kopfbereich wird jetzt ueber `backdrop` eingefaerbt:
 *
 *   "header" — hellgrauer Streifen oben, laeuft nach unten in Weiss aus.
 *              Das ist der Grund, auf dem in der Vorlage der Hero steht.
 *   "surface" — die ganze Seite auf hellgrauem Grund.
 *   "none"   — durchgehend weiss, fuer reine Textseiten.
 */
export function PageShell({
  children,
  backdrop = "header",
  /** Ueberschreibt Hoehe/Position des Kopfbereich-Grundes, z. B. fuer einen hohen Hero. */
  backdropClassName,
  /** Zusaetzliche Klassen fuer das `main`-Element. */
  mainClassName = "",
}: {
  children: ReactNode;
  backdrop?: "header" | "surface" | "none";
  backdropClassName?: string;
  mainClassName?: string;
}) {
  return (
    <div
      className={`relative flex min-h-screen flex-col ${
        backdrop === "surface" ? "bg-surface" : "bg-background"
      } text-foreground`}
    >
      <AnnouncementBar />

      <div className={announcementSpacerClass}>
        <SiteHeader />
      </div>

      <main className={`relative flex-1 ${mainClassName}`}>
        {backdrop === "header" && (
          <div
            aria-hidden="true"
            className={
              backdropClassName ??
              "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-surface-strong to-background"
            }
          />
        )}
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
