"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/plausible";

/**
 * Abschluss-CTA der Startseite. Bewusst der letzte Block vor dem Footer und
 * visuell hart: weißer Kasten auf dunklem Grund, wie der Hero-CTA.
 *
 * Ton: Die Headline ist eine Behauptung über den Leser, keine höfliche Frage.
 * Die frühere Version ("Rechnet sich das für Sie?") hat um Erlaubnis gebeten und
 * gesiezt — beides ist raus. Formulierung stammt wörtlich vom Auftraggeber
 * ("Warum KI bei dir nicht klappt, lass uns reden"), nur von "du" auf "ihr"
 * gedreht, weil die ganze Seite ab dem Hero duzt.
 */
export function FinalCta() {
  return (
    <section className="border-t border-border/60 bg-background py-20 sm:py-24" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="flex flex-col items-start gap-8 border border-border/70 bg-background/40 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[560px]">
            <h2
              id="cta-heading"
              className="kinetic-display text-balance text-[28px] leading-[1.12] text-foreground sm:text-[36px]"
            >
              Warum KI bei euch nicht klappt. Lass uns reden.
            </h2>
            {/* Nur eine Zeile statt des früheren Erklärabsatzes: "kostenlos", "30 Minuten"
                und "unverbindlich" stehen bereits im Button — sie hier zu wiederholen hat
                den CTA weichgespült. Übrig bleibt der Satz, der wehtut. Etwas heller als
                muted-foreground, weil eine Aussage keine Fußnote ist. */}
            <p className="mt-4 text-pretty text-sm leading-[1.6] text-foreground/85 sm:text-[15px]">
              Ihr habt Tools, ihr habt Lizenzen — und im Tagesgeschäft läuft trotzdem alles
              wie vorher.
            </p>
          </div>

          <Link
            href="/lass-uns-reden"
            onClick={() => trackEvent("Calendly_Klick", { position: "home-final-cta" })}
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
