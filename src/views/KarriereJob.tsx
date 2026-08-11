"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, MapPin, Wallet } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import {
  StructuredData,
  getWebPageSchema,
  getBreadcrumbSchema,
} from "@/components/seo/StructuredData";
import type { Job } from "@/data/jobs";
import { company } from "@/config/company";
import { BASE_URL } from "@/lib/metadata";

/**
 * `/karriere/<slug>` — eine Stelle im Detail.
 *
 * ⚠️ Solange die Stelle `isPlaceholder` trägt, steht die Seite auf `noindex` und
 * es wird bewusst KEIN `JobPosting`-JSON-LD ausgegeben. Ein JobPosting-Schema
 * auf einer erfundenen Stelle landet in Google for Jobs und zieht echte
 * Bewerbungen — siehe Kopf von `src/data/jobs.ts`.
 *
 * Bewerbung per E-Mail mit vorbelegtem Betreff. Kein Formular und keine
 * erfundene `karriere@`-Adresse: ein Postfach, das niemand angelegt hat,
 * verschluckt Bewerbungen lautlos.
 */

/** Aufgaben, Profil, Angebot — dreimal dieselbe Bauweise, einmal beschrieben. */
function Liste({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="kinetic-display text-[20px] leading-[1.2] text-foreground sm:text-h3">
        {title}
      </h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-[15px] leading-[1.6] text-foreground/85"
          >
            <span className="mt-[9px] h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function KarriereJob({ job }: { job: Job }) {
  const bewerbungsLink = `mailto:${company.email.general}?subject=${encodeURIComponent(
    `Bewerbung: ${job.title}`
  )}`;

  return (
    <PageShell backdropClassName="absolute inset-x-0 top-0 -z-10 h-[460px]">
      <StructuredData
        data={[
          getWebPageSchema(job.title, job.teaser, `${BASE_URL}/karriere/${job.slug}`),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Karriere", url: `${BASE_URL}/karriere` },
            { name: job.title, url: `${BASE_URL}/karriere/${job.slug}` },
          ]),
        ]}
      />

      <article className={`${SITE_CONTAINER} pb-16 pt-12 sm:pt-16`}>
        <Link
          href="/karriere"
          className="inline-flex items-center gap-2 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Alle Stellen
        </Link>

        <h1 className="kinetic-display kinetic-morph-in mt-8 max-w-[820px] text-balance text-[36px] leading-[1.1] text-foreground sm:text-[44px]">
          {job.title}
        </h1>

        {/* Eckdaten direkt unter der Überschrift: das sind die Angaben, wegen
            denen jemand weiterliest oder eben nicht. */}
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-fliess text-foreground/75">
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
            {job.employmentType}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            {job.location} · {job.workMode}
          </span>
          {job.compensation && (
            <span className="inline-flex items-center gap-2">
              <Wallet className="h-4 w-4 text-accent" aria-hidden="true" />
              {job.compensation}
            </span>
          )}
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:gap-14">
          <div className="min-w-0 space-y-12">
            <p className="max-w-[640px] text-pretty text-lead leading-[1.6] text-foreground/90">
              {job.intro}
            </p>

            <Liste title="Was du machst" items={job.tasks} />
            <Liste title="Was du mitbringst" items={job.profile} />
            <Liste title="Was du bekommst" items={job.offer} />
          </div>

          {/* Bewerbungsblock steht rechts und bleibt beim Lesen im Blick, statt
              erst ganz unten aufzutauchen. */}
          <aside className="h-fit border border-border bg-background/40 p-7 lg:sticky lg:top-8">
            <h2 className="kinetic-display text-[20px] leading-[1.2] text-foreground sm:text-[23px]">
              Bewerben
            </h2>
            <p className="mt-4 text-pretty text-fliess leading-[1.6] text-muted-foreground">
              Ein Absatz dazu, warum du und warum wir. Lebenslauf, wenn du einen hast.
              Anschreiben nach Vorlage lesen wir ohnehin nicht.
            </p>

            <a
              href={bewerbungsLink}
              className="mt-7 inline-flex h-[56px] w-full items-center justify-between gap-4 bg-primary px-6 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span className="flex flex-col text-left">
                <span className="text-fliess font-semibold leading-tight">
                  Bewerbung schreiben
                </span>
                <span className="mt-1 text-mini leading-tight text-primary-foreground/58">
                  {company.email.general}
                </span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </a>

            <p className="mt-6 border-t border-border/60 pt-5 text-[12px] leading-[1.6] text-muted-foreground">
              Fragen vorab? {company.founder.name} antwortet direkt:{" "}
              <a
                href={`mailto:${company.email.founder}`}
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                {company.email.founder}
              </a>
            </p>
          </aside>
        </div>
      </article>
    </PageShell>
  );
}
