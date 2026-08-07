"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { PageHeading } from "@/components/sections/PageHeading";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { StructuredData, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { glossaryTerms } from "@/data/glossary";
import { buildGlossaryIndexSchema } from "@/lib/glossary-schema";
import { BASE_URL } from "@/lib/metadata";

/**
 * `/glossar` — Begriffsübersicht.
 *
 * Die Inhalte (`src/data/glossary.ts`) und die JSON-LD-Erzeugung
 * (`src/lib/glossary-schema.ts`) lagen seit der Next.js-Migration ungenutzt im
 * Repo: die Route zeigte die Baustellenseite, obwohl sechs fertig geschriebene
 * Artikel bereitlagen. Am 05.08.2026 wieder angeschlossen.
 *
 * Optisch neu aufgebaut — die Alt-Seite arbeitete mit abgerundeten Karten und
 * einem Pill-Badge ("Wissen kompakt") über der Überschrift.
 */
export default function Glossar() {
  return (
    <PageShell>
      <StructuredData
        data={[
          // Der Index-Aufbau liefert bereits mehrere Schemas — deshalb spreaden,
          // sonst entsteht ein verschachteltes Array, das kein gültiges JSON-LD ist.
          ...buildGlossaryIndexSchema(),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Glossar", url: `${BASE_URL}/glossar` },
          ]),
        ]}
      />

      <PageHeading
        title="Begriffe, die im Angebot stehen — und was sie bedeuten."
        lead="Sechs Definitionen ohne Buzzwords. Damit im Gespräch klar ist, wovon geredet wird."
      />

      <section className={`${SITE_CONTAINER} py-14 sm:py-16`} aria-labelledby="begriffe">
        <h2 id="begriffe" className="sr-only">
          Alle Begriffe
        </h2>

        {/* Trennlinien-Raster (gap-px auf Border-Grund) statt einzelner Karten:
            die Begriffe gehören zusammen, das soll man auch sehen. */}
        <ul className="grid gap-px border border-border bg-border sm:grid-cols-2">
          {glossaryTerms.map((term) => (
            <li key={term.slug} className="bg-background">
              <Link
                href={`/glossar/${term.slug}`}
                className="group flex h-full flex-col p-7 transition-colors hover:bg-foreground/[0.03]"
              >
                <h3 className="kinetic-display text-[20px] leading-[1.15] text-foreground sm:text-[23px]">
                  {term.term}
                </h3>
                <p className="mt-4 flex-1 text-pretty text-[14px] leading-[1.6] text-muted-foreground">
                  {term.shortDefinition}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-foreground">
                  Weiterlesen
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CtaBanner
        heading="Begriffe klären ist einfach. Prozesse ändern nicht."
        text="Im Erstgespräch reden wir nicht über Definitionen, sondern über einen konkreten Ablauf bei euch."
        position="glossar-uebersicht"
      />
    </PageShell>
  );
}
