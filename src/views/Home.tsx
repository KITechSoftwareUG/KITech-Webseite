"use client";

import Link from "next/link";
import { StructuredData, getWebPageSchema } from "@/components/seo/StructuredData";
import { PageShell } from "@/components/layout/PageShell";
import { ClientResults } from "@/components/sections/ClientResults";
import { teamRoster } from "@/data/team";
import { trackEvent } from "@/lib/plausible";

/**
 * Startseite. Zwei Abschnitte, mehr nicht:
 *
 *   1. Hero — hellgrauer Grund, Aussage, ein Satz darunter, Pill-CTA.
 *      Die beiden Portraits stehen auf dem Desktop an den Seitenraendern, auf
 *      dem Handy als Block unter dem CTA (siehe Kommentar am Bildblock).
 *   2. Drei Referenzkarten nebeneinander mit pulsierendem Pfeil daneben.
 *
 * **Darunter kommt bewusst nichts.** Das ist ausdrueckliche Vorgabe (11.08.2026):
 * "Darunter KOMPLETT LEER LASSEN, ich gebe dir alles vor." Team-Abschnitt und
 * Abschluss-CTA sind deshalb von der Startseite genommen — die Komponenten
 * (`TeamSection`, `FinalCta`) liegen unveraendert im Repo und koennen jederzeit
 * wieder eingehaengt werden. Wer hier ohne Ansage etwas ergaenzt, laeuft der
 * Vorgabe zuwider.
 *
 * Die Aussage im Hero bleibt woertlich, wie sie war.
 */

/** Die beiden Personen im Hero — dieselbe Quelle wie der Team-Abschnitt. */
const ayham = teamRoster.find((m) => m.name.startsWith("Ayham"));
const leon = teamRoster.find((m) => m.name === "Leon");

/**
 * Der Satz unter der Aussage. Auf Ansage vom 11.08.2026 aufgenommen — die
 * Design-Vorlage traegt an dieser Stelle eine Einordnung, und ohne sie steht die
 * Aussage im Hero allein zwischen zwei grossen Leerflaechen.
 *
 * Die Zahl "ueber 50" ist dieselbe wie auf der Referenz-Uebersicht. Aendert sie
 * sich, muss sie hier und in `src/views/Referenzen.tsx` mitgezogen werden.
 */
const HERO_SUBLINE =
  "Über 50 abgeschlossene Projekte — vom ersten Gespräch bis zur Software, die im Tagesgeschäft läuft.";

export default function Home() {
  return (
    <PageShell backdrop="none">
      <StructuredData
        data={getWebPageSchema(
          "KITech Software",
          "Anwendungspartner für KI im deutschen Mittelstand",
          "https://kitech-software.de/"
        )}
      />

      {/*
        Hero. Alle Maße aus der Vorlage gemessen (acquisition.com, 1440 px):
          grauer Bereich   432 px hoch
          Ueberschrift     50 px / 800 / Zeilenhoehe 57,5 px, zentriert, y = 203
          Einordnungssatz  21 px / 400, zentriert
          Knopf            420 × 56 px, Radius 100 px, 20 px / 700
          Portraits        259 px breit, unten buendig, vom Rand angeschnitten

        Die Ueberschrift bleibt auf ALLEN Breiten bei 50 px — die Vorlage
        skaliert sie nicht herunter, sondern laesst sie auf dem Handy vier
        Zeilen fuellen. Das ist gemessen und bewusst uebernommen.
      */}
      <section className="relative isolate overflow-hidden bg-surface-strong">
        {ayham?.photo && (
          <img
            src={ayham.photo}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 hidden w-[18vw] max-w-[259px] select-none object-contain object-bottom sm:block"
          />
        )}
        {leon?.photo && (
          <img
            src={leon.photo}
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

          <p className="mt-[22px] max-w-[590px] text-pretty text-[21px] font-normal leading-[30px] text-foreground">
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
          <p className="mt-3 text-fliess font-normal leading-tight text-muted-foreground">
            30 Minuten, unverbindlich
          </p>

          {/*
            Handy und Tablet: beide Portraits stehen als ein Block unter dem
            Knopf — die Vorlage zeigt dort ein Bild ueber die volle Breite, wo
            auf dem Desktop die beiden Randfiguren stehen. Aus den zwei
            vorhandenen Einzelfreistellern gebaut; `-space-x-6` laesst sie sich
            leicht ueberlappen, damit sie als Gruppe gelesen werden und nicht
            als zwei ausgeschnittene Figuren.
          */}
          <div
            className="-mx-[10px] mt-[30px] flex w-[calc(100%+20px)] items-end justify-center -space-x-4 sm:hidden"
            aria-hidden="true"
          >
            {ayham?.photo && (
              <img src={ayham.photo} alt="" className="w-1/2 select-none object-contain object-bottom" />
            )}
            {leon?.photo && (
              <img src={leon.photo} alt="" className="w-1/2 select-none object-contain object-bottom" />
            )}
          </div>
        </div>
      </section>

      {/* Drei Referenzkarten mit pulsierendem Pfeil. Danach endet die Seite. */}
      <ClientResults />
    </PageShell>
  );
}
