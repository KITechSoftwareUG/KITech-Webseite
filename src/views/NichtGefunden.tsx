"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { mainNavigation } from "@/config/navigation";

/**
 * 404-Seite.
 *
 * Zeigte bis zum 05.08.2026 die Baustellenseite aus der Relaunch-Phase — die war
 * während des Umbaus richtig (jede Route führte dorthin), nach dem Relaunch aber
 * irreführend: Besucher lasen "Gerade im Umbau", obwohl die Seite fertig ist und
 * nur diese eine Adresse nicht existiert.
 *
 * Statt einer Sackgasse steht hier die vollständige Navigation. Wer sich
 * vertippt oder einem alten Link folgt, sieht sofort, was es stattdessen gibt.
 */
export default function NichtGefunden() {
  return (
    <PageShell backdrop="full" backdropVignette>
      <section className={`${SITE_CONTAINER} py-20 sm:py-28`}>
        <p className="kinetic-data text-[64px] font-light leading-none text-accent sm:text-[88px]">
          404
        </p>

        <h1 className="kinetic-display kinetic-morph-in mt-6 max-w-[720px] text-balance text-[32px] leading-[1.1] text-foreground sm:text-[46px]">
          Diese Seite gibt es nicht.
        </h1>

        <p className="mt-6 max-w-[560px] text-pretty text-[17px] leading-[1.5] text-foreground/85">
          Vielleicht ist die Adresse veraltet, vielleicht hat sich ein Zeichen vertippt.
          Hier geht es weiter:
        </p>

        {/* Vollständige Hauptnavigation als Raster. Kommt aus derselben Quelle wie
            Kopf- und Fußzeile — eine neue Seite taucht hier automatisch mit auf. */}
        <nav aria-label="Alle Bereiche" className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {mainNavigation.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="group bg-background p-6 transition-colors hover:bg-foreground/[0.03]"
            >
              <span className="flex items-center justify-between gap-4">
                <span className="text-[16px] font-semibold leading-snug text-foreground">
                  {entry.label}
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                  aria-hidden="true"
                />
              </span>
              {entry.description && (
                <span className="mt-2 block text-[13px] leading-[1.5] text-muted-foreground">
                  {entry.description}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="mt-10 inline-flex h-[52px] items-center gap-3 bg-foreground px-6 text-[13px] font-semibold text-background transition-colors hover:bg-foreground/90"
        >
          Zur Startseite
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </PageShell>
  );
}
