"use client";

import Link from "next/link";
import { ArrowUpRight, UserRound } from "lucide-react";
import { clientResults, type ClientResult } from "@/data/client-results";
import { StarRating } from "@/components/sections/StarRating";
import { trackEvent } from "@/lib/plausible";

/**
 * Kundenbewertungen unter dem Hero: sechs kompakte Karten, zwei Spalten auf
 * Desktop, eine mobil.
 *
 * Umbau am 05.08.2026 auf Ansage. Vorher war das eine Ergebniskarte mit grosser
 * Kennzahl, Zusammenfassung, Vorher/Nachher-Belegzeilen und einem Link auf den
 * Fall — sie war zu hoch und trug zu viel Text. Jetzt steht auf der Karte
 * ausschliesslich:
 *
 *   Kundenbild — Name und Unternehmen — ein kurzer Bewertungssatz — fuenf Sterne
 *
 * Die Sterne sitzen bewusst unmittelbar unter dem Satz: sie bewerten laut
 * Vorgabe die konkrete Kundenaussage, nicht allgemein die Zusammenarbeit. Wer
 * sie in den Kartenkopf zurueckschiebt, kehrt genau das um.
 *
 * Ebenfalls entfallen: das Firmenlogo (das Unternehmen steht als Text) und der
 * "Fall ansehen"-Link. Die Detailseiten unter /referenzen/<slug> gibt es
 * weiterhin — sie sind jetzt ueber die Referenzen-Uebersicht erreichbar, auf
 * die der Link unter dem Raster fuehrt.
 *
 * Das Bild ist dabei GROESSER geworden und liegt nicht mehr ueber den Kartenrand
 * hinaus, sondern als eigene Spalte in der Karte. Dadurch braucht das Raster
 * keinen Zeilenabstand mehr, der einen Ueberstand mittraegt — das war ein Teil
 * der frueheren Bauhoehe.
 *
 * Bewusst scharfkantig (keine rounded-*), passend zum Design-System.
 * Inhalte in src/data/client-results.ts.
 */

/**
 * Aufgehellter Grund hinter dem freigestellten Portrait — dieselbe Rolle wie in
 * TeamSection: ohne ihn verschwinden dunkle Oberteile auf dem dunklen Kartengrund.
 */
const PHOTO_GROUND =
  "bg-[linear-gradient(165deg,hsl(240_14%_40%)_0%,hsl(243_22%_21%)_62%,hsl(243_28%_13%)_100%)]";

/** Gleicher Raum, nur ohne Person davor — fuer Kunden ohne freigegebenes Foto. */
const EMPTY_GROUND =
  "bg-[radial-gradient(120%_90%_at_50%_0%,hsl(243_20%_23%)_0%,hsl(243_24%_13%)_58%,hsl(243_28%_9%)_100%)]";

function ReviewCard({ result }: { result: ClientResult }) {
  return (
    <article className="flex border border-border bg-[linear-gradient(168deg,hsl(245_28%_13%)_0%,hsl(243_20%_9%)_100%)] shadow-[0_16px_38px_hsl(0_0%_0%/0.32)] transition-colors hover:border-primary/60">
      {/* Bildspalte: feste Breite, volle Kartenhoehe. Sie gibt der Karte die
          Mindesthoehe vor — der Textblock daneben ist flacher. */}
      <div
        className={`relative w-[108px] shrink-0 self-stretch overflow-hidden sm:w-[132px] ${
          result.person.photo ? PHOTO_GROUND : EMPTY_GROUND
        }`}
      >
        {result.person.photo ? (
          <img
            src={result.person.photo}
            alt={`${result.person.name}${result.person.role ? `, ${result.person.role}` : ""}`}
            /* absolut + object-cover: das Portrait fuellt die Spalte unabhaengig
               davon, wie hoch die Karte durch den Text nebenan gerade wird. */
            className="absolute inset-0 h-full w-full object-cover object-top drop-shadow-[0_14px_24px_rgba(0,0,0,0.55)]"
            loading="lazy"
          />
        ) : (
          /* Neutraler Platzhalter statt leerer Flaeche — hält alle sechs Karten
             im selben Aufbau, solange nicht jeder Kunde ein Foto freigegeben hat. */
          <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
            <UserRound className="h-12 w-12 text-foreground/20 sm:h-14 sm:w-14" strokeWidth={1} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-[14px] font-semibold leading-tight text-foreground sm:text-[15px]">
          {result.person.name}
        </p>
        <p className="mt-1 text-[12px] leading-tight text-muted-foreground">{result.company}</p>

        {/* Der Bewertungssatz. Fehlt er, rendert hier nichts — kein Platzhaltertext
            und erst recht kein umformulierter Projektbefund: das waere eine
            Bewertung, die dem Kunden in den Mund gelegt wird. */}
        {result.review && (
          <p className="mt-3.5 text-pretty text-[14px] font-medium leading-[1.45] text-foreground sm:text-[15px]">
            „{result.review}“
          </p>
        )}

        {/* Direkt unter der Aussage, damit die Sterne sichtbar zu IHR gehoeren. */}
        <div className={result.review ? "mt-2.5" : "mt-3.5"}>
          <StarRating value={result.rating} />
        </div>
      </div>
    </article>
  );
}

export function ClientResults() {
  return (
    // Kein border-t und kein eigener Hintergrund: der Hero läuft farblich in diese
    // Sektion aus, eine harte Trennlinie würde den Fluss zerschneiden.
    <section
      id="ergebnisse"
      className="scroll-mt-8 bg-background py-12 sm:py-16"
      aria-labelledby="ergebnisse-heading"
    >
      {/* Gleiche Breite wie der Hero: die Karten stehen damit in einer Flucht mit
          der Headline darüber und wirken nicht wie ein zweites Layout. */}
      <div className="mx-auto max-w-[1060px] px-5 sm:px-8">
        <header className="mx-auto max-w-[680px] text-center">
          {/* Nur die Headline, kein erklärender Absatz darunter: die Abfolge
              Headline -> Fließtext ist als Sektionsaufbau ausdrücklich raus. Die
              Einordnung ("das ist eine Auswahl") steht stattdessen als Zeile UNTER
              dem Raster — dort ordnet sie ein, statt vorab zu erklären. */}
          <h2
            id="ergebnisse-heading"
            className="kinetic-display text-balance text-[30px] leading-[1.1] text-foreground sm:text-[38px]"
          >
            Das sagen unsere Kunden.
          </h2>
        </header>

        <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6">
          {clientResults.map((result) => (
            <ReviewCard key={result.slug} result={result} />
          ))}
        </div>

        {/* Die Einordnung "das ist eine Auswahl, kein Gesamtwerk" gehört hierher,
            nicht über die Karten: unter dem Raster ist sie Fazit statt Vorrede.
            ACHTUNG: "Sechs" und "über 50" stehen hier als fester Text, nicht aus
            den Daten. Dieselbe Projektzahl liegt hardcodiert in der Kachel von
            src/views/Referenzen.tsx. Kommt ein siebter Fall in client-results.ts
            dazu oder ändert sich die Projektzahl, müssen beide Stellen von Hand
            mitgezogen werden. (Aus dem Hero von src/views/Home.tsx ist die Zahl
            am 05.08.2026 entfallen.) */}
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-[15px] leading-tight text-muted-foreground">
            <span className="kinetic-data font-semibold text-foreground">Sechs von über 50</span>{" "}
            abgeschlossenen Projekten.
          </p>
          <Link
            href="/referenzen"
            onClick={() => trackEvent("CTA_Klick", { position: "ergebnisse-alle-referenzen" })}
            className="inline-flex items-center gap-1.5 border-b border-foreground/30 pb-0.5 text-[13px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Alle Fälle ansehen
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
