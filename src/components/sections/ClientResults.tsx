"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { homeClientResults, type ClientResult } from "@/data/client-results";
import { ReferencePortrait } from "@/components/sections/ReferencePortrait";
import { StarRating } from "@/components/sections/StarRating";
import { trackEvent } from "@/lib/plausible";

/**
 * Die drei Referenzkarten der Startseite, nebeneinander, mit einem pulsierenden
 * Pfeil rechts daneben.
 *
 * Aufbau und Zahl sind vorgegeben (11.08.2026): **genau drei** Karten und der
 * Pfeil. In der Design-Vorlage steht an dieser Stelle eine Reihe von
 * Kurs-Kacheln; hier tragen dieselbe Position die Kunden.
 *
 * Der Pfeil ist kein Dekor, sondern der Weg zu den uebrigen Faellen: er fuehrt
 * auf `/referenzen`. Er pulsiert dauerhaft (`animate-pulse-nudge`), damit klar
 * ist, dass die drei Karten nicht alles sind. Bei `prefers-reduced-motion`
 * steht er still — die Animation ist ein Hinweis, kein Inhalt, und darf
 * niemanden aus der Seite werfen.
 *
 * Karte selbst: Foto oben (freigestellt, laeuft nach unten aus), darunter Name,
 * Firma, Sterne, die eine Zahl gross, ein Satz, Pill-Button. Reihenfolge folgt
 * dem Blickverlauf — Gesicht, dann Ergebnis, dann Text.
 */

/** Wie viele Karten auf der Startseite stehen. Bewusst hier und nicht in den Daten. */
const ANZAHL_KARTEN = 3;

function ReferenzKarte({ result }: { result: ClientResult }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-border transition-shadow duration-200 hover:shadow-elevated">
      <div className="flex flex-1 flex-col px-6 pb-6 pt-6">
        {/*
          Portrait links neben dem Namen statt als eigenes Bildfeld ueber der
          Karte. Ein Bildfeld mit fester Hoehe stand bei den Faellen ohne Foto als
          leere graue Flaeche da und sah aus wie ein Ladefehler — aktuell liegt
          nur fuer einen der drei Faelle ein Freisteller vor. Fehlt das Foto,
          rendert `ReferencePortrait` nichts und die Zeile rueckt nach links auf.
        */}
        <div className="flex items-start gap-4">
          <ReferencePortrait
            person={result.person}
            className="w-[64px] shrink-0"
            imageClassName="h-[74px]"
          />

          <div className="min-w-0">
            <p className="text-[16px] font-bold leading-tight text-foreground">
              {result.person.name}
            </p>
            <p className="mt-1 text-[13px] font-normal leading-tight text-muted-foreground">
              {result.company}
            </p>
            <div className="mt-2">
              <StarRating value={result.rating} />
            </div>
          </div>
        </div>

        {/* Die eine Zahl — sie traegt die Karte, nicht der Text darunter. */}
        <p className="kinetic-data mt-5 text-[34px] leading-none text-primary">
          {result.headline.value}
        </p>
        <p className="mt-2 text-[14px] font-semibold leading-snug text-foreground">
          {result.headline.label}
        </p>

        {/* Der Bewertungssatz, wo einer belegt ist. Sonst faellt die Zeile weg —
            hier wird nichts erfunden und nichts aus `summary` umformuliert. */}
        {result.review && (
          <p className="mt-4 text-[14px] font-normal italic leading-[1.55] text-muted-foreground">
            „{result.review}“
          </p>
        )}

        {/* Der Fuellraum sitzt in einem eigenen Element statt als `mt-auto` am
            Button: so steht der Button in allen drei Karten auf gleicher Hoehe
            UND haelt einen festen Mindestabstand zum Text darueber. */}
        <div className="flex-1" aria-hidden="true" />

        <Link
          href={`/referenzen/${result.slug}`}
          onClick={() => trackEvent("CTA_Klick", { position: `kundenkarte-${result.slug}` })}
          className="mt-6 flex h-[46px] w-full items-center justify-center rounded-full bg-primary text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Fall ansehen
        </Link>
      </div>
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
      className="scroll-mt-8 bg-background py-14 sm:py-20"
      aria-labelledby="ergebnisse-heading"
    >
      <div className="mx-auto w-full max-w-site px-5 sm:px-8">
        <h2 id="ergebnisse-heading" className="sr-only">
          Kundenreferenzen
        </h2>

        {/*
          Drei Karten plus Pfeil. Auf Desktop steht der Pfeil als vierte Spalte
          rechts daneben (`auto`, damit er nur so breit wird wie noetig), mobil
          rutscht er unter die Karten und bekommt dort einen Text, weil ein
          einzelner Pfeil ohne Beschriftung auf dem Handy nichts erklaert.
        */}
        <div className="grid items-stretch gap-6 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:gap-7">
          {karten.map((result) => (
            <ReferenzKarte key={result.slug} result={result} />
          ))}

          <Link
            href="/referenzen"
            onClick={() => trackEvent("CTA_Klick", { position: "ergebnisse-alle-referenzen" })}
            aria-label="Alle Referenzen ansehen"
            className="group flex items-center justify-center gap-3 rounded-2xl px-2 py-4 text-primary transition-colors hover:text-primary/80 lg:w-[76px] lg:flex-col lg:py-0"
          >
            <ArrowRight
              className="h-9 w-9 animate-pulse-nudge lg:h-11 lg:w-11"
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <span className="text-[15px] font-bold lg:sr-only">Alle Referenzen</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
