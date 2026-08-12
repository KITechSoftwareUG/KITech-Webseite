"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { clientResults, type ClientResult } from "@/data/client-results";
import { ReferencePortrait } from "@/components/sections/ReferencePortrait";
import { StarRating } from "@/components/sections/StarRating";
import { trackEvent } from "@/lib/plausible";

/**
 * Kundenkarten als endlos durchlaufendes Laufband, direkt unter dem Hero.
 *
 * Vorgabe (12.08.2026): "Darunter sollen noch die Bilder der Kunden sein, aber
 * das sollen Karten sein, die einfach nach rechts links durchlaufen. Die gehen
 * automatisch durch." Es laufen **alle sechs** Faelle durch, die mit Foto
 * zuerst — so bestimmt `sortiert` weiter unten.
 *
 * Aufbau der Bewegung: die Liste steht **dreimal** hintereinander im DOM, und
 * die Spur faehrt per CSS-Animation um genau ein Drittel nach links
 * (`.animate-marquee` in src/index.css). Nach einem Durchlauf steht wieder
 * dasselbe Bild wie am Anfang — die Wiederholung ist dadurch unsichtbar und es
 * braucht kein JavaScript, das Positionen nachrechnet.
 *
 * Zwei Ruecksichten sind fest eingebaut:
 *   - Beim Ueberfahren mit der Maus haelt das Band an, damit man eine Karte
 *     lesen und anklicken kann, statt ihr hinterherzuzielen.
 *   - Bei `prefers-reduced-motion` steht es still (Regel in src/index.css).
 *     Ein dauerhaft laufendes Band ist fuer Menschen mit vestibulaeren
 *     Beschwerden ein echtes Problem, nicht nur eine Geschmacksfrage.
 *
 * Die beiden Kopien tragen `aria-hidden`: fuer Screenreader gibt es die Liste
 * genau einmal, sonst laese sie jeden Kunden dreimal vor.
 */

/** Faelle mit Foto zuerst, danach der Rest in Datenreihenfolge. */
const sortiert = [...clientResults].sort((a, b) => {
  const foto = (r: ClientResult) => (r.person.photo ? 0 : 1);
  return foto(a) - foto(b);
});

function LaufbandKarte({ result }: { result: ClientResult }) {
  return (
    <Link
      href={`/referenzen/${result.slug}`}
      onClick={() => trackEvent("CTA_Klick", { position: `laufband-${result.slug}` })}
      className="flex w-[260px] shrink-0 flex-col items-center border border-border px-5 pb-6 pt-5 text-center transition-colors hover:border-primary sm:w-[290px]"
    >
      {/*
        Feste Bildhoehe, damit alle Karten gleich aufgebaut sind. Ohne festen
        Platz saessen Name und Zahl in jeder Karte auf einer anderen Hoehe, und
        beim Durchlaufen wirkt das wie ein Wackeln.

        Reihenfolge: Portrait, sonst Firmenlogo, sonst leer. Die Kennzahl stand
        hier zuerst als blasser Platzhalter — sie erscheint aber weiter unten
        ohnehin und sah dadurch aus wie ein Darstellungsfehler.
      */}
      <div className="flex h-[120px] items-center justify-center">
        {result.person.photo ? (
          <ReferencePortrait
            person={result.person}
            className="w-[104px]"
            imageClassName="h-[120px]"
          />
        ) : result.logo ? (
          <img
            src={result.logo}
            alt=""
            aria-hidden="true"
            className="max-h-[64px] w-auto max-w-[150px] object-contain"
            loading="lazy"
          />
        ) : null}
      </div>

      <p className="mt-4 text-fliess font-bold leading-tight text-foreground">
        {result.person.name}
      </p>
      <p className="mt-1 text-mini font-normal text-muted-foreground">{result.company}</p>

      <div className="mt-2.5">
        <StarRating value={result.rating} />
      </div>

      <p className="kinetic-data mt-4 text-[28px] leading-none text-primary">
        {result.headline.value}
      </p>
      <p className="mt-1.5 text-mini font-semibold leading-snug text-foreground">
        {result.headline.label}
      </p>
    </Link>
  );
}

export function KundenLaufband() {
  return (
    <section
      id="ergebnisse"
      className="scroll-mt-8 overflow-hidden bg-background pb-[50px] pt-[50px]"
      aria-labelledby="ergebnisse-heading"
    >
      <h2 id="ergebnisse-heading" className="sr-only">
        Kundenreferenzen
      </h2>

      {/* Das Band laeuft ueber die volle Fensterbreite, nicht im Seitencontainer:
          eine Bewegung, die an einer Containerkante beginnt und endet, sieht aus
          wie ein Fehler. Der Container gilt erst wieder fuer den Link darunter. */}
      <div className="group relative">
        <div className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused]">
          {[0, 1, 2].map((durchlauf) => (
            <div
              key={durchlauf}
              className="flex gap-6"
              aria-hidden={durchlauf > 0 ? "true" : undefined}
            >
              {sortiert.map((result) => (
                <LaufbandKarte key={`${durchlauf}-${result.slug}`} result={result} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-site justify-center px-[10px] dt:px-0">
        <Link
          href="/referenzen"
          onClick={() => trackEvent("CTA_Klick", { position: "laufband-alle-referenzen" })}
          className="inline-flex items-center gap-3 text-fliess font-bold text-primary transition-opacity hover:opacity-75"
        >
          Alle Referenzen ansehen
          <ArrowRight className="h-6 w-6 animate-pulse-nudge" strokeWidth={2.5} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
