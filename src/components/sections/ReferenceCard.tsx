"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock, ExternalLink } from "lucide-react";
import { kartenLink, type ClientResult } from "@/data/client-results";
import { ReferencePortrait } from "@/components/sections/ReferencePortrait";
import { StarRating } from "@/components/sections/StarRating";
import { StattSterne } from "@/components/sections/StattSterne";
import { trackEvent } from "@/lib/plausible";

/**
 * DIE Kundenkarte — eine Komponente fuer beide Einsatzorte:
 *   - Referenz-Uebersicht (`/referenzen`): ganze Karte ist der Link.
 *   - Startseite (`ClientResults.tsx`): zusaetzlich Beleglinks, deshalb NICHT
 *     als Ganzes verlinkt (ein <a> in einem <Link> waere ungueltiges HTML).
 *
 * Am 05.08.2026 zusammengefuehrt: die Startseite hatte eine eigene, engere
 * Variante mit dem Portrait in einem grauen Kasten. Auf Ansage gilt jetzt das
 * Design der Referenz-Uebersicht ueberall — freigestelltes Portrait, das oben
 * aus der Karte ragt, Sterne und Logo in einer Zeile unter dem Namen, grosszuegige
 * Abstaende. Zwei getrennte Karten waren genau der Grund, warum die beiden
 * Seiten auseinandergelaufen sind; deshalb hier nur noch eine.
 *
 * Das Portrait steht bewusst OHNE Rahmen und ohne Hintergrundflaeche im Layout.
 * Ein Kasten drumherum liess es wie ein Ausweisfoto wirken. Liegt kein Foto vor,
 * rendert `ReferencePortrait` nichts und der Text rueckt nach links auf — auch
 * das bewusst, ein Silhouetten-Platzhalter zog nur Aufmerksamkeit auf die Luecke.
 *
 * Seit dem Wechsel auf das helle Design (11.08.2026) ist die Karte weiss,
 * `rounded-lg`, mit `shadow-card` und `ring-1 ring-border` — dieselbe Form wie
 * die Startseitenkarte in `ClientResults.tsx`. Vorher trug sie einen dunklen
 * Verlauf mit hartem Schlagschatten. Die Kennzahl steht jetzt in Dunkelblau, der
 * frueher lime Akzent laeuft ueberall ueber `--primary`.
 */
export function ReferenceCard({
  result,
  /**
   * Startseite: zeigt zusaetzlich den "Live im Einsatz"-Block und die
   * Kundenwebsite. Schaltet die Karte von "ganz Link" auf "Links einzeln" um.
   */
  withProofLinks = false,
}: {
  result: ClientResult;
  withProofLinks?: boolean;
}) {
  const hasFacts = Boolean(result.duration || (result.before && result.after) || result.extra);

  /* Wohin die Karte fuehrt — Detailseite oder direkt zum Produkt. Steht in den
     Daten (`klickZiel`), damit beide Einbaustellen dasselbe tun. */
  const ziel = kartenLink(result);

  // Weisse Karte auf hellem Grund: sichtbar wird sie ueber den feinen Ring und
  // den Schatten, nicht ueber einen Eigengrund. Beim Ueberfahren hebt sie sich
  // an (`shadow-elevated`) statt die Rahmenfarbe zu wechseln — auf Weiss ist die
  // Hoehenaenderung das deutlichere Signal.
  const cardClass =
    "group relative flex h-full flex-col rounded-lg bg-white p-6 border border-border sm:p-8";

  const inner = (
    <>
      <div className="flex items-start gap-5">
        <ReferencePortrait
          person={result.person}
          className="-mt-8 w-[96px] shrink-0 sm:-mt-10 sm:w-[116px]"
          imageClassName="h-[132px] sm:h-[152px]"
        />

        <div className="min-w-0 pt-1">
          {/* Ohne Person steht die Firma oben — sonst begaenne die Karte mit
              einer leeren Zeile, wo sonst der Name steht. */}
          {result.person ? (
            <>
              <p className="text-[15px] font-bold leading-tight text-foreground sm:text-base">
                {result.person.name}
              </p>
              {result.person.role && (
                <p className="mt-1 text-[12px] font-normal leading-tight text-muted-foreground">
                  {result.person.role}
                </p>
              )}
              <p className="mt-1.5 text-[12px] font-normal leading-tight text-muted-foreground">
                {result.company}
              </p>
            </>
          ) : (
            <p className="text-[15px] font-bold leading-tight text-foreground sm:text-base">
              {result.company}
            </p>
          )}

          {/* Bewertung und Logo teilen sich eine Zeile — untereinander wuerden sie
              den Kartenkopf unnoetig in die Hoehe ziehen.
              Der frueher noetige weisse Kasten hinter dem Logo ist entfallen: die
              Karte ist jetzt selbst weiss, und alle hinterlegten Kundenlogos sind
              dunkel auf transparent — auf Weiss stehen sie ohne Hilfsflaeche. */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            {result.rating !== null ? (
              <StarRating value={result.rating} />
            ) : (
              result.stattSterne && <StattSterne text={result.stattSterne} />
            )}
            {result.logo && (
              <span className="inline-flex h-10 items-center">
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

      {/* Die eine Zahl — sie trägt die Karte, nicht der Text darunter. In Dunkelblau,
          weil das die einzige Signalfarbe ist und die Zahl der einzige Beweis. */}
      <p className="kinetic-data mt-7 text-[46px] leading-none text-primary sm:text-[54px]">
        {result.headline.value}
      </p>
      <p className="mt-3 max-w-[320px] text-[15px] font-semibold leading-tight text-foreground">
        {result.headline.label}
      </p>

      <p className="mt-5 text-pretty text-fliess font-normal leading-[1.6] text-muted-foreground">
        {result.summary}
      </p>

      {hasFacts && (
        <dl className="mt-6 space-y-2.5 border-t border-border pt-5 text-fliess">
          {result.duration && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Projektdauer</dt>
              <Clock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <dd className="font-semibold text-foreground">{result.duration}</dd>
            </div>
          )}
          {result.before && result.after && (
            <div className="flex flex-wrap items-center gap-2">
              <dt className="sr-only">Vorher und nachher</dt>
              <dd className="font-normal text-muted-foreground line-through decoration-muted-foreground/50">
                {result.before}
              </dd>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <dd className="font-semibold text-foreground">{result.after}</dd>
            </div>
          )}
          {result.extra && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Weitere Kennzahl</dt>
              <dd className="font-semibold text-primary">{result.extra}</dd>
            </div>
          )}
        </dl>
      )}

      {/* Das belegte Kundenzitat, wo eines vorliegt. Dunkelblaue Kante statt der
          frueheren Lime-Kante — es gibt nur noch eine Akzentfarbe. */}
      {result.review && (
        <p className="mt-5 border-l-2 border-primary pl-3.5 text-fliess font-medium italic leading-[1.5] text-foreground">
          „{result.review}“
        </p>
      )}
    </>
  );

  // Uebersicht: ein einziges Klickziel ueber die ganze Karte. Ein 300 px hoher
  // Klickbereich trifft sich am Handy deutlich besser als eine Textzeile am Fuss.
  if (!withProofLinks) {
    /* Die Pille sagt, wohin es geht. Bei einem Fall ohne Detailseite waere
       "Fall ansehen" eine falsche Ankuendigung — dort steht die Adresse. */
    const pille = (
      <div className="mt-auto pt-7">
        <span className="inline-flex h-[46px] w-fit items-center gap-1.5 rounded-full bg-primary px-6 text-[15px] font-bold text-primary-foreground transition-colors group-hover:bg-primary/90">
          {ziel.extern ? (
            <>
              {hostLabel(ziel.href)} öffnen
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </>
          ) : (
            <>
              Fall ansehen
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </span>
      </div>
    );

    // Nach draussen: kein `Link`, sondern ein echtes `<a>` mit `target="_blank"`
    // — der Besucher soll die Referenzliste behalten, wenn er sich das Produkt
    // ansieht.
    if (ziel.extern) {
      return (
        <a
          href={ziel.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("CTA_Klick", { position: `referenz-karte-${result.slug}` })}
          className={cardClass}
        >
          {inner}
          {pille}
        </a>
      );
    }

    return (
      <Link
        href={ziel.href}
        onClick={() => trackEvent("CTA_Klick", { position: `referenz-karte-${result.slug}` })}
        className={cardClass}
      >
        {inner}
        {/* Der Abstand sitzt auf dem Wrapper, nicht auf der Pille: ein `pt-7`
            direkt auf der dunkelblauen Flaeche wuerde sie oben aufblaehen. */}
        {pille}
      </Link>
    );
  }

  return (
    <article className={cardClass}>
      {inner}

      {/* Der Live-Link auf das gebaute Produkt: eigener Block mit Akzentkante,
          weil er der ueberpruefbarste Beweis auf der ganzen Seite ist. "Wir haben
          ein Portal gebaut" ist eine Behauptung, "hier ist es" ist ein Beweis.
          Sehr schwach dunkelblau hinterlegt statt gefuellt: der Block soll sich vom
          Kartenweiss absetzen, aber der Pille darunter nicht die Wirkung nehmen. */}
      {result.liveUrl && (
        <a
          href={result.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("CTA_Klick", { position: `live-link-${result.slug}` })}
          className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] px-3.5 py-3 transition-colors hover:border-primary/60 hover:bg-primary/[0.11]"
        >
          <span className="min-w-0">
            <span className="block text-mini font-bold uppercase tracking-wide text-primary">
              Live im Einsatz
            </span>
            <span className="mt-0.5 block truncate text-fliess font-medium text-foreground">
              {hostLabel(result.liveUrl)}
            </span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        </a>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-7">
        {result.companyUrl ? (
          <a
            href={result.companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-normal text-muted-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-primary"
          >
            {hostLabel(result.companyUrl)}
          </a>
        ) : (
          <span />
        )}

        {/* Faelle ohne Detailseite (`klickZiel: "live"`) bekommen hier keine
            zweite Pille: ihr Klickziel steht schon als „Live im Einsatz"-Block
            weiter oben, und zweimal dieselbe Adresse in einer Karte ist eine
            Wiederholung, kein zusaetzlicher Weg. */}
        {!ziel.extern && (
          <Link
            href={ziel.href}
            onClick={() => trackEvent("CTA_Klick", { position: `kundenkarte-${result.slug}` })}
            className="inline-flex h-[46px] items-center gap-1.5 rounded-full bg-primary px-6 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Fall ansehen
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  );
}

/** "https://dashboard.niimmo.de" -> "dashboard.niimmo.de" */
function hostLabel(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
