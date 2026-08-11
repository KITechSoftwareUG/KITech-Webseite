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
 *   1. Hero — hellgrauer Grund, zwei freigestellte Personen an den Raendern,
 *      mittig die eine Aussage plus dunkelblauer Pill-CTA.
 *   2. Drei Referenzkarten nebeneinander mit pulsierendem Pfeil daneben.
 *
 * **Darunter kommt bewusst nichts.** Das ist ausdrueckliche Vorgabe (11.08.2026):
 * "Darunter KOMPLETT LEER LASSEN, ich gebe dir alles vor." Team-Abschnitt und
 * Abschluss-CTA sind deshalb von der Startseite genommen — die Komponenten
 * (`TeamSection`, `FinalCta`) liegen unveraendert im Repo und koennen jederzeit
 * wieder eingehaengt werden. Wer hier ohne Ansage etwas ergaenzt, laeuft der
 * Vorgabe zuwider.
 *
 * Die Aussage im Hero bleibt woertlich, wie sie war — nur ihre Gestaltung ist
 * neu. Der frueher entfernte Positionierungsabsatz kommt NICHT zurueck.
 */

/** Die beiden Personen an den Hero-Raendern — dieselbe Quelle wie der Team-Abschnitt. */
const ayham = teamRoster.find((m) => m.name.startsWith("Ayham"));
const leon = teamRoster.find((m) => m.name === "Leon");

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
        Hero. Der graue Grund laeuft ueber die volle Breite, der Inhalt sitzt im
        Seitencontainer. Die Portraits stehen absolut an den Raendern und sind
        unter `lg` ausgeblendet: auf schmalen Fenstern wuerden sie den Text
        ueberlagern, und beschnittene Koepfe sehen nach Fehler aus.
      */}
      <section className="relative isolate overflow-hidden bg-surface-strong">
        {ayham?.photo && (
          <img
            src={ayham.photo}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 hidden h-[86%] w-auto select-none object-contain object-bottom lg:block xl:h-[92%]"
          />
        )}
        {leon?.photo && (
          <img
            src={leon.photo}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 hidden h-[86%] w-auto select-none object-contain object-bottom lg:block xl:h-[92%]"
          />
        )}

        <div className="relative mx-auto flex min-h-[380px] w-full max-w-site flex-col items-center justify-center px-5 py-16 text-center sm:px-8 sm:py-20 lg:min-h-[460px] lg:py-24">
          {/*
            Versalien und Gewicht 800 sind der praegendste Zug der Vorlage.
            Der dunkelblaue Marker sitzt auf dem einen Wort, das die Aussage traegt —
            frueher war er weiss auf dunklem Grund, jetzt umgekehrt.
          */}
          <h1 className="kinetic-morph-in max-w-[15ch] text-balance text-[30px] font-extrabold uppercase leading-[1.08] tracking-tight text-foreground sm:text-[42px] lg:text-[54px]">
            Falsche KI kostet{" "}
            <span className="box-decoration-clone bg-primary px-2.5 pb-1 text-primary-foreground">
              mehr
            </span>{" "}
            als keine KI.
          </h1>

          <Link
            href="/lass-uns-reden"
            onClick={() => trackEvent("Calendly_Klick", { position: "home-hero" })}
            className="mt-9 inline-flex h-[56px] w-full max-w-[420px] items-center justify-center rounded-full bg-primary px-8 text-[16px] font-bold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 sm:mt-10 sm:text-[20px]"
          >
            Kostenloses Erstgespräch buchen
          </Link>

          <p className="mt-4 text-[13px] font-normal text-muted-foreground">
            30 Minuten, unverbindlich
          </p>
        </div>
      </section>

      {/* Drei Referenzkarten mit pulsierendem Pfeil. Danach endet die Seite. */}
      <ClientResults />
    </PageShell>
  );
}
