"use client";

import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { PageHeading } from "@/components/sections/PageHeading";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ClientResults } from "@/components/sections/ClientResults";
import { StructuredData, getWebPageSchema } from "@/components/seo/StructuredData";
import { trackEvent } from "@/lib/plausible";
import { BASE_URL } from "@/lib/metadata";
import { fokusContent as c } from "@/data/fokus";

/**
 * LinkedIn-Landingpage `/fokus` — siehe `src/data/fokus.ts` für Inhalt und
 * Herkunft. Beat-Reihenfolge nach `funnel-narrativ` Schema A, erweitert um
 * Angebot (Preis) und Zielgruppen-Abgrenzung (Beats, die reine
 * Segment-Seiten wie /solo nicht brauchen, ein bezahltes Einzelangebot schon).
 *
 * OFFEN: CTA verlinkt wie überall auf `/lass-uns-reden` (Calendly
 * "roi-analyse") — das ist der allgemeine Kalender der KI-Bewertung, kein
 * dediziertes Buchungs-/Zahlungsformular für den 299-€-Workshop. Braucht
 * Ayhams Entscheidung, ob das reicht oder ein eigener Slot/Zahlungslink nötig
 * ist, bevor die Seite live/indexiert geht.
 */
export function Fokus() {
  return (
    <PageShell backdropClassName="absolute inset-x-0 top-0 -z-10 h-[560px] sm:h-[640px]">
      <StructuredData
        data={[getWebPageSchema(`${c.headline} ${c.headlineHighlight}`, c.lead, `${BASE_URL}/fokus`)]}
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
            <span className="text-fliess font-semibold leading-tight">Workshop-Platz sichern</span>
            <span className="mt-1 text-mini leading-tight text-primary-foreground/58">299 €, 60-90 Minuten</span>
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

      {/* Kennst du das auch: Trennlinien-Liste. */}
      <section className={`${SITE_CONTAINER} pb-16`} aria-labelledby="erkennung">
        <h2
          id="erkennung"
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

      {/* Kundenstimmen: funnel-narrativ Schema A, Beat 4. */}
      <ClientResults />

      {/* Grundkonzept: drei nummerierte Schritte, dasselbe Muster wie "Ablauf"
          auf /solo und /enterprise. */}
      <section className={`${SITE_CONTAINER} py-16`} aria-labelledby="konzept">
        <h2
          id="konzept"
          className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[36px]"
        >
          {c.processHeading}
        </h2>
        <p className="mt-5 max-w-[640px] text-pretty text-[16px] leading-[1.55] text-foreground/85 sm:text-[18px]">
          {c.processIntro}
        </p>

        <ol className="mt-9 grid gap-px border border-border bg-border md:grid-cols-3">
          {c.process.map((step) => (
            <li key={step.number} className="bg-background p-7">
              <span className="kinetic-data text-h3 font-light leading-none text-accent">
                {step.number}
              </span>
              <h3 className="mt-5 text-lead font-semibold leading-snug text-foreground sm:text-lead">
                {step.title}
              </h3>
              <p className="mt-3 text-pretty text-fliess leading-[1.6] text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Angebot: eigener Beat, den /solo und /enterprise so nicht brauchen
          (Einzelangebot mit Preis statt allgemeiner Segment-Beschreibung). */}
      <section className={`${SITE_CONTAINER} pb-16`} aria-labelledby="angebot">
        <div className="border border-border p-8 sm:p-12">
          <h2
            id="angebot"
            className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[30px]"
          >
            {c.offer.title}
          </h2>

          <ul className="mt-8 max-w-[520px]">
            {c.offer.includes.map((item, index) => (
              <li
                key={item}
                className={`flex items-start gap-3 py-3 text-[15px] leading-snug text-foreground/90 ${
                  index > 0 ? "border-t border-border/60" : ""
                }`}
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-fliess text-muted-foreground">{c.offer.excludes}</p>

          <div className="mt-10 flex flex-wrap items-end gap-4 border-t border-border pt-8">
            <span className="text-h4 font-medium text-muted-foreground line-through">
              {c.offer.priceOld}
            </span>
            <span className="kinetic-data text-[44px] font-light leading-none text-foreground">
              {c.offer.priceNew}
            </span>
            <span className="border border-border px-3 py-1 text-fliess font-semibold text-foreground">
              {c.offer.discountLabel}
            </span>
          </div>

          <Link
            href="/lass-uns-reden"
            onClick={() => trackEvent("Calendly_Klick", { position: "fokus-angebot" })}
            className="mt-10 inline-flex h-[56px] w-full max-w-[320px] items-center justify-between gap-4 bg-primary px-6 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <span className="flex flex-col text-left">
              <span className="text-fliess font-semibold leading-tight">Workshop-Platz sichern</span>
              <span className="mt-1 text-mini leading-tight text-primary-foreground/58">299 €, 60-90 Minuten</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Fuer wen geeignet: zwei Trennlinien-Spalten statt Kartenraster. */}
      <section className={`${SITE_CONTAINER} pb-16`} aria-labelledby="zielgruppe">
        <h2 id="zielgruppe" className="sr-only">
          Für wen der Workshop geeignet ist
        </h2>
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h3 className="text-lead font-semibold leading-snug text-foreground sm:text-lead">
              {c.fit.forTitle}
            </h3>
            <ul className="mt-5">
              {c.fit.for.map((item, index) => (
                <li
                  key={item}
                  className={`flex items-start gap-3 py-3 text-[15px] leading-snug text-foreground/90 ${
                    index > 0 ? "border-t border-border/60" : ""
                  }`}
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lead font-semibold leading-snug text-foreground sm:text-lead">
              {c.fit.notTitle}
            </h3>
            <ul className="mt-5">
              {c.fit.not.map((item, index) => (
                <li
                  key={item}
                  className={`flex items-start gap-3 py-3 text-[15px] leading-snug text-foreground/90 ${
                    index > 0 ? "border-t border-border/60" : ""
                  }`}
                >
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2.5} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBanner
        heading={c.cta.heading}
        text={c.cta.text}
        position="fokus-cta"
        label="Workshop-Platz sichern"
        hint="299 €, 60-90 Minuten"
      />
    </PageShell>
  );
}
