"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock, ExternalLink, UserRound } from "lucide-react";
import { clientResults, type ClientResult } from "@/data/client-results";
import { StarRating } from "@/components/sections/StarRating";
import { trackEvent } from "@/lib/plausible";

/**
 * Kunden-Ergebniskarten unter dem Hero: sechs Karten, zwei Spalten auf Desktop,
 * eine mobil. Jede Karte ist ein Beweis, kein Teaser.
 *
 * Reihenfolge auf der Karte ist bewusst gewaehlt und folgt dem Blickverlauf:
 *   1. Gesicht + Name + Sterne   -> "hier steht ein echter Mensch dahinter"
 *   2. DIE ZAHL, gross, mit Akzentlinie darunter -> das Ergebnis, vor jedem Text
 *   3. ein Satz, was gebaut wurde -> Einordnung
 *   4. harte Belegzeilen (Dauer, vorher/nachher)
 *   5. der Live-Link auf das gebaute Produkt -> der eigentliche Trust-Anker
 *
 * Zur Historie: Am 05.08.2026 war diese Karte kurzzeitig auf Foto, Name, Zitat
 * und Sterne zusammengestrichen — ohne jede Zahl. Das ist auf Ansage
 * zurueckgenommen ("ganz prominent die Ergebnisse zeigen"). Die Sterne aus
 * jenem Umbau bleiben, sie stehen jetzt in der Kopfzeile neben der Person.
 *
 * Der Live-Link ist das staerkste Element der Karte und deshalb visuell als
 * eigener Block gesetzt, nicht als Textlink nebenbei: "wir haben ein Portal
 * gebaut" ist eine Behauptung, "hier ist es, klick drauf" ist ein Beweis.
 *
 * Bewusst scharfkantig (keine rounded-*), passend zum Design-System.
 * Inhalte in src/data/client-results.ts.
 */

/**
 * Aufgehellter Grund hinter dem freigestellten Portrait. Ohne ihn verschwinden
 * dunkle Oberteile auf dem dunklen Kartengrund — gleiche Rolle wie in TeamSection.
 */
const PHOTO_GROUND =
  "bg-[linear-gradient(165deg,hsl(240_14%_40%)_0%,hsl(243_22%_21%)_62%,hsl(243_28%_13%)_100%)]";

/** Gleicher Raum, nur ohne Person davor — fuer Kunden ohne freigegebenes Foto. */
const EMPTY_GROUND =
  "bg-[radial-gradient(120%_90%_at_50%_0%,hsl(243_20%_23%)_0%,hsl(243_24%_13%)_58%,hsl(243_28%_9%)_100%)]";

/** "https://dashboard.niimmo.de" -> "dashboard.niimmo.de" */
function hostLabel(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function ResultCard({ result }: { result: ClientResult }) {
  return (
    <article className="flex flex-col border border-border bg-[linear-gradient(168deg,hsl(245_28%_13%)_0%,hsl(243_20%_9%)_100%)] shadow-[0_20px_50px_hsl(0_0%_0%/0.35)] transition-colors hover:border-primary/60">
      <div className="flex">
        {/* Bildspalte: feste Breite, volle Hoehe des Kartenkopfs. */}
        <div
          className={`relative w-[104px] shrink-0 self-stretch overflow-hidden sm:w-[124px] ${
            result.person.photo ? PHOTO_GROUND : EMPTY_GROUND
          }`}
        >
          {result.person.photo ? (
            <img
              src={result.person.photo}
              alt={`${result.person.name}${result.person.role ? `, ${result.person.role}` : ""}`}
              className="absolute inset-0 h-full w-full object-cover object-top drop-shadow-[0_14px_24px_rgba(0,0,0,0.55)]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
              <UserRound className="h-11 w-11 text-foreground/20 sm:h-12 sm:w-12" strokeWidth={1} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold leading-tight text-foreground sm:text-[15px]">
                {result.person.name}
              </p>
              <p className="mt-1 text-[12px] leading-tight text-muted-foreground">
                {result.company}
              </p>
            </div>
            <div className="shrink-0 pt-0.5">
              <StarRating value={result.rating} />
            </div>
          </div>

          {/* Die eine Zahl — der Held der Karte. Die Akzentlinie darunter ist
              woertlich die Unterstreichung: `w-fit` am Wrapper haelt sie exakt
              so breit wie die Zahl, statt quer durch die Karte zu laufen. */}
          <div className="mt-4 w-fit sm:mt-5">
            <p className="kinetic-data text-[40px] font-light leading-none text-foreground sm:text-[50px]">
              {result.headline.value}
            </p>
            <span className="mt-2 block h-[3px] w-full bg-accent" aria-hidden="true" />
          </div>
          <p className="mt-2.5 max-w-[300px] text-[14px] font-semibold leading-tight text-foreground sm:text-[15px]">
            {result.headline.label}
          </p>
        </div>
      </div>

      {/* Ab hier laeuft der Inhalt ueber die volle Kartenbreite — unter der
          Bildspalte ist sonst nur Leerraum, und der Text braucht die Zeilenlaenge. */}
      <div className="flex flex-1 flex-col px-4 pb-4 sm:px-5 sm:pb-5">
        <p className="text-pretty text-[13px] leading-[1.6] text-muted-foreground sm:text-[14px]">
          {result.summary}
        </p>

        {/* Harte Belegzeilen: Dauer und Prozessvergleich. */}
        {(result.duration || (result.before && result.after) || result.extra) && (
          <dl className="mt-4 space-y-2 border-t border-border/60 pt-3.5 text-[13px]">
            {result.duration && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Projektdauer</dt>
                <Clock className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                <dd className="font-semibold text-foreground">{result.duration}</dd>
              </div>
            )}
            {result.before && result.after && (
              <div className="flex flex-wrap items-center gap-2">
                <dt className="sr-only">Vorher und nachher</dt>
                <dd className="text-muted-foreground line-through decoration-muted-foreground/50">
                  {result.before}
                </dd>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                <dd className="font-semibold text-foreground">{result.after}</dd>
              </div>
            )}
            {result.extra && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Weitere Kennzahl</dt>
                <dd className="font-semibold text-accent">{result.extra}</dd>
              </div>
            )}
          </dl>
        )}

        {/* Das belegte Kundenzitat, wo eines vorliegt. */}
        {result.review && (
          <p className="mt-4 border-l-2 border-accent/70 pl-3 text-[13px] font-medium italic leading-[1.5] text-foreground sm:text-[14px]">
            „{result.review}“
          </p>
        )}

        {/* Der Live-Link auf das gebaute Produkt: eigener Block, Akzentkante,
            weil er der ueberpruefbarste Beweis auf der ganzen Seite ist. */}
        {result.liveUrl && (
          <a
            href={result.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("CTA_Klick", { position: `live-link-${result.slug}` })}
            className="group mt-4 flex items-center justify-between gap-3 border border-accent/40 bg-accent/[0.07] px-3 py-2.5 transition-colors hover:border-accent hover:bg-accent/[0.13]"
          >
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-accent">
                Live im Einsatz
              </span>
              <span className="mt-0.5 block truncate text-[13px] font-medium text-foreground">
                {hostLabel(result.liveUrl)}
              </span>
            </span>
            <ExternalLink
              className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        )}

        {/* Fusszeile: Logo als Firmenbeleg, daneben der Weg in den Fall.
            Heller Kasten hinter dem Logo, weil die Kundenlogos gemischt sind
            (transparent, weiss hinterlegt, dunkle Schrift) und auf dem dunklen
            Kartengrund sonst teils verschwinden. */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-4">
          <div className="flex items-center gap-3">
            {result.logo && (
              <span className="inline-flex h-9 items-center bg-white px-2.5">
                <img
                  src={result.logo}
                  alt={`${result.company} Firmenlogo`}
                  className="max-h-6 w-auto max-w-[104px] object-contain"
                  loading="lazy"
                />
              </span>
            )}
            {result.companyUrl && (
              <a
                href={result.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-muted-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-foreground"
              >
                {hostLabel(result.companyUrl)}
              </a>
            )}
          </div>

          <Link
            href={`/referenzen/${result.slug}`}
            onClick={() => trackEvent("CTA_Klick", { position: `kundenkarte-${result.slug}` })}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground transition-colors hover:text-primary"
          >
            Fall ansehen
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
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
            Was am Ende zählt, steht hier.
          </h2>
        </header>

        <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2">
          {clientResults.map((result) => (
            <ResultCard key={result.slug} result={result} />
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
