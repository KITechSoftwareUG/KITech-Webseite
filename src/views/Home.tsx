"use client";

import Link from "next/link";
import { StructuredData, getWebPageSchema } from "@/components/seo/StructuredData";
import { PageShell } from "@/components/layout/PageShell";
import { KundenLaufband } from "@/components/sections/KundenLaufband";
import { teamRoster } from "@/data/team";
import { trackEvent } from "@/lib/plausible";

/**
 * Startseite. Zwei Abschnitte, mehr nicht:
 *
 *   1. Hero — hellgrauer Grund, Aussage, ein Satz darunter, Pill-CTA.
 *      Rechts steht Ayham; auf dem Handy unter dem Knopf.
 *   2. Kundenkarten als durchlaufendes Laufband.
 *
 * **Darunter kommt bewusst nichts.** Das ist ausdrueckliche Vorgabe (11.08.2026):
 * "Darunter KOMPLETT LEER LASSEN, ich gebe dir alles vor." Team-Abschnitt und
 * Abschluss-CTA sind deshalb von der Startseite genommen — die Komponenten
 * (`TeamSection`, `FinalCta`) liegen unveraendert im Repo.
 *
 * **Nur eine Person im Hero** (Vorgabe 12.08.2026): "Ich moechte, dass in beiden
 * Versionen nur ich als erstes Foto auftauche." Leons Portrait ist deshalb aus
 * dem Hero genommen — er bleibt im Team-Abschnitt und als Kunde im Laufband.
 *
 * Geometrie aus der Vorlage gemessen (acquisition.com, 1440 px):
 *   grauer Bereich   432 px hoch
 *   Ueberschrift     50 px / 800 / Zeilenhoehe 57,5 px, zentriert, y = 203
 *   Einordnungssatz  21 px / 400
 *   Knopf            420 x 56 px, Radius 100 px, 20 px / 700
 *   Portrait         259 px breit (18 % der Fensterbreite), unten buendig
 */

/**
 * Ersatz, solange die neue freigestellte Aufnahme fehlt: das vorhandene
 * Team-Portrait. Welcher Pfad tatsaechlich gilt, entscheidet der Server-Wrapper
 * `src/app/page.tsx` beim Build (siehe Kommentar dort) und reicht ihn als
 * `heroPortrait` herein.
 */
const ersatzPortrait = teamRoster.find((m) => m.name.startsWith("Ayham"))?.photo ?? null;

/**
 * Der Satz unter der Aussage. Die Zahl "ueber 50" ist dieselbe wie auf der
 * Referenz-Uebersicht. Aendert sie sich, muss sie hier und in
 * `src/views/Referenzen.tsx` mitgezogen werden.
 */
const HERO_SUBLINE =
  "Über 50 abgeschlossene Projekte — vom ersten Gespräch bis zur Software, die im Tagesgeschäft läuft.";

export default function Home({
  /** Freigestelltes Hero-Portrait, vom Server-Wrapper geprüft. `null` => Ersatz. */
  heroPortrait = null,
}: {
  heroPortrait?: string | null;
}) {
  const portrait = heroPortrait ?? ersatzPortrait;

  return (
    <PageShell backdrop="none">
      <StructuredData
        data={getWebPageSchema(
          "KITech Software",
          "Anwendungspartner für KI im deutschen Mittelstand",
          "https://kitech-software.de/"
        )}
      />

      <section className="relative isolate overflow-hidden bg-surface-strong">
        {/*
          Desktop: das Portrait steht absolut am rechten Rand und wird vom
          Fensterrand angeschnitten. 18 % der Fensterbreite entspricht den in
          der Vorlage gemessenen 259 px bei 1440.
        */}
        {portrait && (
          <img
            src={portrait}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 hidden w-[18vw] max-w-[259px] select-none object-contain object-bottom sm:block"
          />
        )}

        <div className="relative mx-auto flex w-full max-w-site flex-col items-center px-[10px] pt-[40px] text-center sm:pt-[70px] lg:pt-[100px] dt:h-[432px] dt:px-0 dt:pt-[70px]">
          <h1 className="kinetic-morph-in max-w-[13ch] text-balance text-[50px] font-extrabold uppercase leading-[57.5px] tracking-tight text-foreground">
            Falsche KI kostet{" "}
            <span className="box-decoration-clone bg-primary px-2 text-primary-foreground">
              mehr
            </span>{" "}
            als keine KI.
          </h1>

          <p className="mt-[22px] max-w-[590px] text-pretty text-subline font-normal text-foreground">
            {HERO_SUBLINE}
          </p>

          <Link
            href="/lass-uns-reden"
            onClick={() => trackEvent("Calendly_Klick", { position: "home-hero" })}
            className="mt-[39px] inline-flex h-[52px] w-full items-center justify-center rounded-[100px] bg-primary px-[10px] text-[20px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 dt:h-[56px] dt:w-[420px]"
          >
            Kostenloses Erstgespräch buchen
          </Link>

          {/* Der Hinweis steht in der Vorlage nicht — er gehoert zu unserem
              Inhalt und bleibt deshalb. Klein gesetzt, damit er die Geometrie
              des Hero nicht verschiebt. */}
          <p className="mt-3 text-mini font-normal text-muted-foreground">
            30 Minuten, unverbindlich
          </p>

          {/*
            Handy und Tablet: das Portrait steht unter dem Knopf, mittig und
            unten buendig — dort, wo die Vorlage ihr Hero-Bild zeigt.
          */}
          {portrait && (
            <div className="mt-[30px] flex w-full justify-center sm:hidden" aria-hidden="true">
              <img
                src={portrait}
                alt=""
                className="h-[320px] w-auto select-none object-contain object-bottom"
              />
            </div>
          )}
        </div>
      </section>

      {/* Kundenkarten als durchlaufendes Band. Danach endet die Seite. */}
      <KundenLaufband />
    </PageShell>
  );
}
