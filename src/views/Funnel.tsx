"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { PageHeading } from "@/components/sections/PageHeading";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ClientResults } from "@/components/sections/ClientResults";
import { StructuredData, getWebPageSchema } from "@/components/seo/StructuredData";
import { BASE_URL } from "@/lib/metadata";
import { funnelContent as c } from "@/data/funnel";

/**
 * LinkedIn-Landingpage `/funnel` — siehe `src/data/funnel.ts` für Inhalt und
 * Herkunft. Beat-Reihenfolge nach `funnel-narrativ` Schema A: Hero,
 * Pattern-Interrupt, Problem, Kundenstimmen, Lösung, CTA.
 *
 * Bewusst kein eigenes Kartendesign, keine eigene Akzentfarbe — dieselben
 * Bausteine wie `/solo` und `/enterprise` (`PageHeading`, `ClientResults`,
 * `CtaBanner`), nur andere Reihenfolge (Kundenstimmen vor der Lösung statt
 * danach — kalter Traffic braucht den Beweis früher).
 */
export function Funnel() {
  return (
    <PageShell backdropClassName="absolute inset-x-0 top-0 -z-10 h-[560px] sm:h-[640px]">
      <StructuredData
        data={[getWebPageSchema(`${c.headline} ${c.headlineHighlight}`, c.lead, `${BASE_URL}/funnel`)]}
      />

      <PageHeading
        title={
          <>
            {c.headline}{" "}
            <span className="box-decoration-clone bg-primary px-2.5 pb-1 text-primary-foreground">
              {c.headlineHighlight}
            </span>
          </>
        }
        lead={c.lead}
      >
        <Link
          href="/lass-uns-reden"
          className="mt-10 inline-flex h-[56px] w-full max-w-[320px] items-center justify-between gap-4 bg-primary px-6 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <span className="flex flex-col text-left">
            <span className="text-fliess font-semibold leading-tight">Erstgespräch buchen</span>
            <span className="mt-1 text-mini leading-tight text-primary-foreground/58">
              30 Minuten, unverbindlich
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
        </Link>
      </PageHeading>

      {/* Pattern-Interrupt: funnel-narrativ Schema A, Beat 2. */}
      <section className={`${SITE_CONTAINER} pb-16 pt-4`} aria-labelledby="verbrannt">
        <h2
          id="verbrannt"
          className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[36px]"
        >
          {c.patternInterrupt.heading}
        </h2>
        <p className="mt-5 max-w-[640px] text-pretty text-[16px] leading-[1.55] text-foreground/85 sm:text-[18px]">
          {c.patternInterrupt.body}
        </p>
      </section>

      {/* Problem: Trennlinien-Liste, dasselbe Muster wie /solo und /enterprise. */}
      <section className={`${SITE_CONTAINER} pb-16`} aria-labelledby="problem">
        <h2
          id="problem"
          className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[36px]"
        >
          {c.painHeading}
        </h2>

        <ul className="mt-10 max-w-[860px]">
          {c.painPoints.map((point, index) => (
            <li
              key={point}
              className={`py-6 text-[16px] leading-[1.5] text-foreground/88 sm:text-lead ${
                index > 0 ? "border-t border-border/60" : ""
              }`}
            >
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* Kundenstimmen: funnel-narrativ Schema A, Beat 4 -- vor der Loesung,
          nicht danach (Unterschied zu /solo, /enterprise). */}
      <ClientResults />

      {/* Loesung: gap-px Raster, dasselbe Muster wie "Was gebaut wird". */}
      <section className={`${SITE_CONTAINER} py-16`} aria-labelledby="loesung">
        <h2
          id="loesung"
          className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[36px]"
        >
          {c.solutionHeading}
        </h2>
        <p className="mt-5 max-w-[640px] text-pretty text-[16px] leading-[1.55] text-foreground/85 sm:text-[18px]">
          {c.solutionIntro}
        </p>

        <ul className="mt-9 grid gap-px border border-border bg-border sm:grid-cols-2">
          {c.solutionItems.map((item) => (
            <li key={item.title} className="bg-background p-7">
              <h3 className="text-lead font-semibold leading-snug text-foreground sm:text-lead">
                {item.title}
              </h3>
              <p className="mt-3 text-pretty text-fliess leading-[1.6] text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-9 max-w-[640px] text-balance text-lead font-semibold leading-snug text-foreground sm:text-h4">
          {c.solutionOutro}
        </p>
      </section>

      <CtaBanner heading={c.cta.heading} text={c.cta.text} position="funnel-cta" />
    </PageShell>
  );
}
