"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import type { ClientResult } from "@/data/client-results";
import { ReferencePortrait } from "@/components/sections/ReferencePortrait";
import { StarRating } from "@/components/sections/StarRating";
import { trackEvent } from "@/lib/plausible";

/**
 * Karte im Raster der Referenz-Übersicht. Gleiche Bildsprache wie die
 * Ergebniskarten auf der Startseite (`ClientResults.tsx`), aber ohne den
 * überstehenden Portrait-Block: die Übersicht zeigt sechs Karten dicht
 * untereinander, der Überstand würde dort nur Abstand fressen.
 *
 * Die ganze Karte ist der Link — auf der Übersicht gibt es kein zweites Ziel,
 * und ein 300 px hoher Klickbereich trifft sich am Handy deutlich besser als eine
 * Textzeile am Kartenfuß.
 */
export function ReferenceCard({ result }: { result: ClientResult }) {
  const hasFacts = Boolean(result.duration || (result.before && result.after) || result.extra);

  return (
    <Link
      href={`/referenzen/${result.slug}`}
      onClick={() => trackEvent("CTA_Klick", { position: `referenz-karte-${result.slug}` })}
      className="group relative flex h-full flex-col border border-border bg-[linear-gradient(168deg,hsl(245_28%_13%)_0%,hsl(243_20%_9%)_100%)] p-6 shadow-[0_20px_50px_hsl(0_0%_0%/0.35)] transition-colors hover:border-primary/60 sm:p-8"
    >
      <div className="flex items-start gap-5">
        <ReferencePortrait
          person={result.person}
          className="-mt-8 w-[96px] shrink-0 sm:-mt-10 sm:w-[116px]"
          imageClassName="h-[132px] sm:h-[152px]"
        />

        <div className="min-w-0 pt-1">
          <p className="text-[15px] font-semibold leading-tight text-foreground sm:text-base">
            {result.person.name}
          </p>
          {result.person.role && (
            <p className="mt-1 text-[12px] leading-tight text-muted-foreground">
              {result.person.role}
            </p>
          )}
          <p className="mt-1.5 text-[12px] leading-tight text-muted-foreground">{result.company}</p>

          {/* Bewertung und Logo teilen sich eine Zeile, wie auf den Ergebniskarten
              der Startseite.
              Heller Kasten hinter dem Logo: die Kundenlogos sind gemischt (transparent,
              weiß hinterlegt, dunkle Schrift) und würden sonst teils verschwinden. */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <StarRating value={result.rating} />
            {result.logo && (
              <span className="inline-flex h-10 items-center bg-white px-2.5">
                <img
                  src={result.logo}
                  alt={`${result.company} Firmenlogo`}
                  className="max-h-7 w-auto max-w-[112px] object-contain"
                  loading="lazy"
                />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Die eine Zahl — sie trägt die Karte, nicht der Text darunter. */}
      <p className="kinetic-data mt-7 text-[46px] font-light leading-none text-foreground sm:text-[54px]">
        {result.headline.value}
      </p>
      <p className="mt-3 max-w-[320px] text-[15px] font-semibold leading-tight text-foreground">
        {result.headline.label}
      </p>

      <p className="mt-5 text-pretty text-[14px] leading-[1.6] text-muted-foreground">
        {result.summary}
      </p>

      {hasFacts && (
        <dl className="mt-6 space-y-2.5 border-t border-border/60 pt-5 text-[13px]">
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

      <span className="mt-auto inline-flex w-fit items-center gap-1.5 pt-7 text-[13px] font-semibold text-foreground transition-colors group-hover:text-primary">
        Fall ansehen
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
