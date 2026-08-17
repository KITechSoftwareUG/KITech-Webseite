"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { homeClientResults, type ClientResult } from "@/data/client-results";
import { StarRating } from "@/components/sections/StarRating";
import { trackEvent } from "@/lib/plausible";

/**
 * Die drei Referenzkarten der Startseite, nebeneinander, mit einem pulsierenden
 * Pfeil rechts daneben.
 *
 * Aufbau und Zahl sind vorgegeben (11.08.2026): **genau drei** Karten und der
 * Pfeil. Darunter endet die Seite.
 *
 * Geometrie aus der Design-Vorlage gemessen (acquisition.com, 1440 px). Dort
 * steht an dieser Stelle eine Reihe aus vier Kurs-Kacheln:
 *   Spalte    293 px (Container 1170 ÷ 4), davon 15 px Innenabstand je Seite
 *   Karte     263 px breit, Innenabstand 10 px oben/unten
 *   Titel     20 px / 800, zentriert
 *   Knopf     253 × 60 px, Radius 50 px, 16 px / 400, Innenabstand 15/20 px
 *   Trennlinie ueber der Reihe, rund 710 px breit, zentriert
 *
 * Drei Karten plus Pfeilspalte ergeben zusammen wieder 4 × 293 px — die Reihe
 * fluchtet damit exakt wie die Vorlage.
 *
 * **Die Karten haben bewusst keinen Kasten**: kein Hintergrund, kein Rahmen,
 * kein Schatten. In der Vorlage sind es freie, zentrierte Spalten. Ein weisser
 * Kasten mit Schatten war die vorherige Fassung und ein Zug, den die Vorlage
 * nicht hat.
 */

/** Wie viele Karten auf der Startseite stehen. Bewusst hier und nicht in den Daten. */
const ANZAHL_KARTEN = 3;

function ReferenzKarte({ result }: { result: ClientResult }) {
  return (
    <article className="flex h-full flex-col items-center px-[15px] py-[10px] text-center">
      {/* Bewusst ohne Portrait: In der Vorlage tragen alle Kacheln einer Reihe
          denselben Aufbau. Bei uns liegt nur fuer einen der drei Faelle ein
          Freisteller vor — mit Bild standen Sterne und Kennzahl in den drei
          Karten auf verschiedener Hoehe und die Reihe wirkte verrutscht. Die
          Gesichter stehen im Hero und auf /referenzen. */}
      {result.rating !== null && <StarRating value={result.rating} />}

      {/* Die eine Zahl — sie traegt die Karte. In der Vorlage steht an dieser
          Stelle der Kurstitel in 20 px / 800; die Zahl darf groesser sein, weil
          sie kuerzer ist und den Beweis traegt. */}
      <p className="kinetic-data mt-4 text-[38px] leading-none text-primary">
        {result.headline.value}
      </p>
      <p className="mt-2 text-[20px] font-extrabold leading-[1.2] text-foreground">
        {result.headline.label}
      </p>

      <p className="mt-3 text-[15px] font-normal leading-[19.5px] text-muted-foreground">
        {result.person ? result.person.name : result.company}
        {result.person && result.company ? ` · ${result.company}` : ""}
      </p>

      {/* Der Bewertungssatz, wo einer belegt ist. Sonst faellt die Zeile weg —
          hier wird nichts erfunden und nichts aus `summary` umformuliert. */}
      {result.review && (
        <p className="mt-4 text-[15px] font-normal italic leading-[21px] text-muted-foreground">
          „{result.review}“
        </p>
      )}

      {/* Fuellraum in einem eigenen Element, damit der Knopf in allen drei
          Karten auf gleicher Hoehe steht und trotzdem Abstand nach oben haelt. */}
      <div className="flex-1" aria-hidden="true" />

      <Link
        href={`/referenzen/${result.slug}`}
        onClick={() => trackEvent("CTA_Klick", { position: `kundenkarte-${result.slug}` })}
        className="mt-6 flex h-[60px] w-full max-w-[253px] items-center justify-center rounded-[50px] bg-primary px-5 text-[16px] font-normal text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Fall ansehen
      </Link>
    </article>
  );
}

export function ClientResults() {
  // `homeClientResults` statt `clientResults`: einzelne Faelle sind per
  // `hideOnHome` von der Startseite ausgenommen (siehe src/data/client-results.ts).
  const karten = homeClientResults.slice(0, ANZAHL_KARTEN);

  return (
    <section
      id="ergebnisse"
      className="scroll-mt-8 bg-background pb-[60px] pt-[50px]"
      aria-labelledby="ergebnisse-heading"
    >
      <div className="mx-auto w-full max-w-site px-[15px]">
        <h2 id="ergebnisse-heading" className="sr-only">
          Kundenreferenzen
        </h2>

        {/* Trennlinie ueber der Reihe wie in der Vorlage: rund 710 px breit,
            zentriert, in der Randfarbe. */}
        <div className="mx-auto mb-[44px] h-px w-full max-w-[710px] bg-border" aria-hidden="true" />

        {/*
          Vier Spalten wie in der Vorlage: drei Karten plus die Pfeilspalte.
          Unter 1025 px stehen die Karten untereinander — die Vorlage bricht
          dort auf zwei Spalten um, das ergibt bei drei Karten aber eine
          angebrochene zweite Reihe.
        */}
        <div className="grid items-stretch gap-y-10 dt:grid-cols-4 dt:gap-y-0">
          {karten.map((result) => (
            <ReferenzKarte key={result.slug} result={result} />
          ))}

          <Link
            href="/referenzen"
            onClick={() => trackEvent("CTA_Klick", { position: "ergebnisse-alle-referenzen" })}
            aria-label="Alle Referenzen ansehen"
            className="group flex items-center justify-center gap-3 px-[15px] py-4 text-primary transition-colors hover:text-primary/80 dt:py-0"
          >
            <ArrowRight
              className="h-9 w-9 animate-pulse-nudge dt:h-11 dt:w-11"
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <span className="text-[16px] font-bold dt:sr-only">Alle Referenzen</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
