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

      <section className="relative isolate overflow-hidden bg-surface-strong">
        {/*
          Desktop: die Portraits stehen absolut an den Seitenraendern und werden
          vom Fensterrand angeschnitten. Bewusst schmal (240/270 px) — in der
          Vorlage sind sie rund 260 px breit und rahmen den Text, statt mit ihm
          um Aufmerksamkeit zu konkurrieren.
        */}
        {ayham?.photo && (
          <img
            src={ayham.photo}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 hidden w-[240px] select-none object-contain object-bottom lg:block xl:w-[270px]"
          />
        )}
        {leon?.photo && (
          <img
            src={leon.photo}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 hidden w-[240px] select-none object-contain object-bottom lg:block xl:w-[270px]"
          />
        )}

        <div className="relative mx-auto flex w-full max-w-site flex-col items-center px-5 pb-0 pt-12 text-center sm:px-8 sm:pt-16 lg:min-h-[460px] lg:justify-center lg:pb-16 lg:pt-20">
          {/*
            Versalien und Gewicht 800 sind der praegendste Zug der Vorlage. Die
            Groessen folgen ihr: rund 38 px auf dem Handy (dort traegt die
            Aussage vier Zeilen), 54 px ab Desktop.
          */}
          <h1 className="kinetic-morph-in max-w-[15ch] text-balance text-[38px] font-extrabold uppercase leading-[1.06] tracking-tight text-foreground sm:text-[46px] lg:text-[54px]">
            Falsche KI kostet{" "}
            <span className="box-decoration-clone bg-primary px-2.5 pb-1 text-primary-foreground">
              mehr
            </span>{" "}
            als keine KI.
          </h1>

          <p className="mt-6 max-w-[540px] text-pretty text-[17px] font-normal leading-[1.5] text-foreground/80 sm:mt-7 sm:text-[19px]">
            {HERO_SUBLINE}
          </p>

          <Link
            href="/lass-uns-reden"
            onClick={() => trackEvent("Calendly_Klick", { position: "home-hero" })}
            className="mt-8 inline-flex h-[56px] w-full max-w-[420px] items-center justify-center rounded-full bg-primary px-8 text-[17px] font-bold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 sm:mt-9 sm:text-[20px]"
          >
            Kostenloses Erstgespräch buchen
          </Link>

          <p className="mt-4 text-[13px] font-normal text-muted-foreground">
            30 Minuten, unverbindlich
          </p>

          {/*
            Handy und Tablet: beide Portraits stehen als ein Block unter dem CTA,
            unten buendig und leicht ineinander gerueckt — die Entsprechung zum
            Paarfoto der Vorlage, aus den beiden vorhandenen Einzelfreistellern
            gebaut. Vorher waren sie unter `lg` ganz ausgeblendet; damit fehlte
            dem Hero auf dem Handy sein Gesicht.

            `-space-x-6` laesst die beiden sich leicht ueberlappen, damit sie als
            eine Gruppe gelesen werden und nicht als zwei ausgeschnittene Figuren.
          */}
          <div
            className="mt-10 flex h-[260px] w-full items-end justify-center -space-x-6 sm:h-[320px] lg:hidden"
            aria-hidden="true"
          >
            {ayham?.photo && (
              <img
                src={ayham.photo}
                alt=""
                className="h-full w-auto max-w-[48%] select-none object-contain object-bottom"
              />
            )}
            {leon?.photo && (
              <img
                src={leon.photo}
                alt=""
                className="h-full w-auto max-w-[48%] select-none object-contain object-bottom"
              />
            )}
          </div>
        </div>
      </section>

      {/* Drei Referenzkarten mit pulsierendem Pfeil. Danach endet die Seite. */}
      <ClientResults />
    </PageShell>
  );
}
