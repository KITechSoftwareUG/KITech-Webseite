"use client";

import type { ReactNode } from "react";
import {
  StructuredData,
  getOrganizationSchema,
  getWebSiteSchema,
} from "@/components/seo/StructuredData";
import { AnnouncementBar } from "./AnnouncementBar";
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
 * Der Balken steht `sticky` im normalen Fluss und braucht deshalb keinen
 * Abstandshalter mehr (siehe `AnnouncementBar`).
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
      {/*
        Unternehmen und Website als Datenknoten — einmal auf jeder Seite, die
        diesen Rahmen benutzt.

        **Warum hier und nicht im Root-Layout:** Nicht jede Seite dieser Website
        darf die Marke tragen. `/selbstcheck_eu_ai_act` laeuft auf Ansage
        markenfrei ueber `CheckShell` — kein Logo, kein Firmenname, kein
        Absender. Ein Organisations-Knoten mit Name, Anschrift und Telefonnummer
        im Kopf dieser Seite waere genau das, was dort nicht hingehoert. Im
        Root-Layout haette er sie erwischt.

        **Warum nicht nur auf der Startseite:** Jede Artikel- und Autorenseite
        verweist mit `publisher` bzw. `worksFor` auf `ORGANISATION_ID`. Steht der
        Knoten nur auf `/`, muss ein Pruefer erst die Startseite abrufen, um den
        Herausgeber eines Artikels aufzuloesen — und ein Sprachmodell, das nur
        die Artikelseite liest, bekommt ihn nie zu sehen.

        Bis zum 20.08.2026 stand er auf **keiner** Seite: `getOrganizationSchema()`
        war gebaut und mit Unit-Tests abgedeckt, aber nirgends eingebunden. Alle
        Verweise auf `#organisation` zeigten ins Leere, und die Website trug kein
        einziges `sameAs` — bei einer Marke, die sich mit „KITech NextGen
        Solutions" (kitech.ai) verwechseln laesst.
      */}
      <StructuredData data={[getOrganizationSchema(), getWebSiteSchema()]} />

      <AnnouncementBar />
      <SiteHeader />

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
