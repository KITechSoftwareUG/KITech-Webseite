"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { PageHeading } from "@/components/sections/PageHeading";
import {
  StructuredData,
  getWebPageSchema,
  getBreadcrumbSchema,
} from "@/components/seo/StructuredData";
import { jobs } from "@/data/jobs";
import { company } from "@/config/company";
import { BASE_URL } from "@/lib/metadata";

/**
 * `/karriere` — die offenen Stellen.
 *
 * ⚠️ Die Stellen in `src/data/jobs.ts` sind aktuell Platzhalter. Solange das so
 * ist, steht die Route auf `noindex` und wird kein `JobPosting`-JSON-LD
 * ausgegeben — siehe Kopf der Datendatei.
 *
 * Bewerbungen laufen per E-Mail an die allgemeine Adresse mit vorbelegtem
 * Betreff. Bewusst keine erfundene `karriere@`-Adresse: eine Adresse, die kein
 * Postfach hat, verschluckt Bewerbungen lautlos.
 */
export default function Karriere() {
  return (
    <PageShell>
      <StructuredData
        data={[
          getWebPageSchema(
            "Karriere",
            "Offene Stellen bei KITech Software in Hannover.",
            `${BASE_URL}/karriere`
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Karriere", url: `${BASE_URL}/karriere` },
          ]),
        ]}
      />

      <PageHeading
        title="Wir sind klein. Das ist der Punkt."
        lead="Keine Abteilung zwischen dir und der Entscheidung. Dafür trägst du, was du baust."
      />

      <section className={`${SITE_CONTAINER} py-14 sm:py-16`} aria-labelledby="stellen">
        <h2
          id="stellen"
          className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[36px]"
        >
          {jobs.length} offene {jobs.length === 1 ? "Stelle" : "Stellen"}
        </h2>

        {/* Stellen als durchlaufende Liste mit Trennlinien: Titel und Eckdaten
            links, Pfeil rechts. Kartenraster würde vier gleich wichtige Kacheln
            suggerieren — hier soll man von oben nach unten lesen. */}
        <ul className="mt-9 divide-y divide-border/60 border-y border-border/60">
          {jobs.map((job) => (
            <li key={job.slug}>
              <Link
                href={`/karriere/${job.slug}`}
                className="group flex flex-col gap-5 py-8 transition-colors hover:bg-foreground/[0.02] sm:flex-row sm:items-center sm:justify-between sm:gap-10"
              >
                <div className="min-w-0">
                  <h3 className="kinetic-display text-balance text-[21px] leading-[1.15] text-foreground sm:text-[25px]">
                    {job.title}
                  </h3>

                  <p className="mt-3 max-w-[620px] text-pretty text-fliess leading-[1.6] text-muted-foreground">
                    {job.teaser}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-foreground/70">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      {job.employmentType}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      {job.location} · {job.workMode}
                    </span>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center gap-2 text-fliess font-semibold text-foreground">
                  Stelle ansehen
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

      {/* Initiativbewerbung: eigener Block, weil bei vier Stellen die passende
          oft nicht dabei ist. */}
      <section className={`${SITE_CONTAINER} pb-20 sm:pb-24`} aria-labelledby="initiativ">
        <div className="flex flex-col items-start gap-8 border border-border bg-background/40 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[560px]">
            <h2
              id="initiativ"
              className="kinetic-display text-balance text-h3 leading-[1.12] text-foreground sm:text-[30px]"
            >
              Nichts dabei, aber du kannst etwas, das wir brauchen?
            </h2>
            <p className="mt-4 text-pretty text-[15px] leading-[1.6] text-foreground/85">
              Dann schreib uns, was das ist. Ein Absatz reicht — Anschreiben nach Vorlage
              lesen wir ohnehin nicht.
            </p>
          </div>

          <a
            href={`mailto:${company.email.general}?subject=${encodeURIComponent("Initiativbewerbung")}`}
            className="inline-flex h-[56px] w-full max-w-[320px] shrink-0 items-center justify-between gap-4 bg-primary px-6 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <span className="flex flex-col text-left">
              <span className="text-fliess font-semibold leading-tight">
                Initiativ bewerben
              </span>
              <span className="mt-1 text-mini leading-tight text-primary-foreground/58">
                {company.email.general}
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </section>
    </PageShell>
  );
}
