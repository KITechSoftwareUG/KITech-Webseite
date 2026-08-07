"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { trackEvent } from "@/lib/plausible";

/**
 * Abschluss-CTA am Fuß einer Seite: Aussage links, weißer Button rechts.
 *
 * Aufbau und Maße standen bis zum 05.08.2026 zweimal wörtlich gleich im Repo
 * (`FinalCta`, `ReferenceCta`) und wären mit jeder neuen Seite ein drittes und
 * viertes Mal dazugekommen. Beide bauen jetzt hierauf auf und geben nur noch
 * ihren Text und ihre Tracking-Position mit.
 *
 * Der Text bleibt bewusst pro Seite verschieden: wer von der Startseite über die
 * Referenzen zu den Leistungen läuft, soll nicht dreimal denselben Block lesen.
 * Die *Form* ist überall gleich, die *Aussage* nicht.
 */
export function CtaBanner({
  heading,
  /** Eine Zeile, die die Überschrift beantwortet — kein Erklärabsatz. */
  text,
  /** Landet als `position` im Plausible-Event. Muss pro Einbaustelle eindeutig sein. */
  position,
  label = "Kostenloses Erstgespräch buchen",
  hint = "30 Minuten, unverbindlich",
  href = "/lass-uns-reden",
}: {
  heading: string;
  text: string;
  position: string;
  label?: string;
  hint?: string;
  href?: string;
}) {
  /** Aus der Position eine gültige, eindeutige DOM-ID für die Überschrift bauen. */
  const headingId = `cta-${position.replace(/[^a-z0-9]+/gi, "-")}`;

  return (
    <section
      className="border-t border-border/60 bg-background py-20 sm:py-24"
      aria-labelledby={headingId}
    >
      <div className={SITE_CONTAINER}>
        <div className="flex flex-col items-start gap-8 border border-border/70 bg-background/40 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[560px]">
            <h2
              id={headingId}
              className="kinetic-display text-balance text-[28px] leading-[1.12] text-foreground sm:text-[36px]"
            >
              {heading}
            </h2>
            {/* Nur eine Zeile statt eines Erklärabsatzes: "kostenlos", "30 Minuten"
                und "unverbindlich" stehen bereits im Button — sie hier zu wiederholen
                spült den CTA weich. Übrig bleibt der Satz, der wehtut. Etwas heller
                als muted-foreground, weil eine Aussage keine Fußnote ist. */}
            <p className="mt-4 text-pretty text-sm leading-[1.6] text-foreground/85 sm:text-[15px]">
              {text}
            </p>
          </div>

          <Link
            href={href}
            onClick={() => trackEvent("Calendly_Klick", { position })}
            className="inline-flex h-[56px] w-full max-w-[320px] shrink-0 items-center justify-between gap-4 bg-foreground px-6 text-background transition-colors hover:bg-foreground/90"
          >
            <span className="flex flex-col text-left">
              <span className="text-[13px] font-semibold leading-tight">{label}</span>
              <span className="mt-1 text-[11px] font-normal leading-tight text-background/58">
                {hint}
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
