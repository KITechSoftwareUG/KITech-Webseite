"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/plausible";

/**
 * Abschluss-CTA der Referenz-Seiten. Optisch identisch zum `FinalCta` der
 * Startseite — eigene Komponente nur, weil das Plausible-Event dort fest auf
 * `home-final-cta` steht und die Auswertung sonst nicht mehr auseinander hielte,
 * von welcher Seite die Buchung kam.
 *
 * Ton: Headline nach der wörtlichen Vorgabe des Auftraggebers ("warum in deinem
 * Unternehmen KI dir keinen Umsatz bringen würde"), auf "ihr" gedreht und im
 * Indikativ statt Konjunktiv — "bringt" behauptet, "bringen würde" relativiert.
 * Der Text steht direkt hinter den Kundenfällen und dreht sie bewusst um: dort
 * hat es funktioniert, hier ist der Grund, warum bei euch nicht.
 *
 * Bewusst anderer Text als in `FinalCta`: wer von der Startseite über die
 * Referenzen läuft, soll nicht denselben Block zweimal lesen.
 */
export function ReferenceCta({ position }: { position: string }) {
  return (
    <section
      className="border-t border-border/60 bg-background py-20 sm:py-24"
      aria-labelledby="referenz-cta-heading"
    >
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="flex flex-col items-start gap-8 border border-border/70 bg-background/40 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[560px]">
            <h2
              id="referenz-cta-heading"
              className="kinetic-display text-balance text-[28px] leading-[1.12] text-foreground sm:text-[36px]"
            >
              Warum KI in eurem Unternehmen keinen Umsatz bringt.
            </h2>
            {/* Eine Zeile, die die Headline beantwortet, statt eines Erklärabsatzes.
                Muss auf Übersicht und Detailseite gleichermaßen sitzen, deshalb kein
                Bezug auf "die Fälle oben" — auf der Detailseite steht darüber nur einer. */}
            <p className="mt-4 text-pretty text-sm leading-[1.6] text-foreground/85 sm:text-[15px]">
              Nicht weil die Technik fehlt, sondern weil niemand den Prozess dahinter
              anfasst.
            </p>
          </div>

          <Link
            href="/lass-uns-reden"
            onClick={() => trackEvent("Calendly_Klick", { position })}
            className="inline-flex h-[56px] w-full max-w-[320px] shrink-0 items-center justify-between gap-4 bg-foreground px-6 text-background transition-colors hover:bg-foreground/90"
          >
            <span className="flex flex-col text-left">
              <span className="text-[13px] font-semibold leading-tight">
                Kostenloses Erstgespräch buchen
              </span>
              <span className="mt-1 text-[11px] font-normal leading-tight text-background/58">
                30 Minuten, unverbindlich
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
