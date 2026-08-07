"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { TEXT_CONTAINER } from "@/components/layout/site-container";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { StructuredData } from "@/components/seo/StructuredData";
import { getTermBySlug, type GlossaryTerm } from "@/data/glossary";
import { buildGlossaryTermSchema } from "@/lib/glossary-schema";

/**
 * `/glossar/<slug>` — ein Begriff im Detail.
 *
 * Fließtext in schmaler Spalte (`TEXT_CONTAINER`), nicht über die volle
 * Seitenbreite: die Artikel sind zum Lesen da, nicht zum Überfliegen.
 *
 * Verwandte Begriffe stehen am Fuß. Ein Slug in `related`, zu dem es keinen
 * Eintrag gibt, wird stillschweigend weggelassen statt als toter Link
 * gerendert — sonst zeigt die Seite auf eine 404.
 */
export default function GlossarTerm({ term }: { term: GlossaryTerm }) {
  const verwandte = term.related
    .map((slug) => getTermBySlug(slug))
    .filter((eintrag): eintrag is GlossaryTerm => Boolean(eintrag));

  return (
    <PageShell backdropClassName="absolute inset-x-0 top-0 -z-10 h-[420px]">
      <StructuredData data={buildGlossaryTermSchema(term)} />

      <article className={`${TEXT_CONTAINER} pb-16 pt-12 sm:pt-16`}>
        <Link
          href="/glossar"
          className="inline-flex items-center gap-2 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Alle Begriffe
        </Link>

        <h1 className="kinetic-display kinetic-morph-in mt-8 text-balance text-[34px] leading-[1.1] text-foreground sm:text-[44px]">
          {term.term}
        </h1>

        {/* Die Kurzdefinition steht als Lead direkt unter der Überschrift und
            wiederholt sich bewusst nicht im ersten Abschnitt darunter. */}
        <p className="mt-6 text-pretty text-[17px] leading-[1.55] text-foreground/90 sm:text-[19px]">
          {term.shortDefinition}
        </p>

        <div className="mt-12 space-y-10">
          {term.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="kinetic-display text-[21px] leading-[1.2] text-foreground sm:text-[25px]">
                {section.heading}
              </h2>
              <p className="mt-4 text-pretty text-[15px] leading-[1.7] text-foreground/82">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        {term.faqs?.length ? (
          <section className="mt-14 border-t border-border pt-10" aria-labelledby="faq">
            <h2
              id="faq"
              className="kinetic-display text-[21px] leading-[1.2] text-foreground sm:text-[25px]"
            >
              Häufige Fragen
            </h2>

            <dl className="mt-7 divide-y divide-border/60 border-y border-border/60">
              {term.faqs.map((faq) => (
                <div key={faq.question} className="py-6">
                  <dt className="text-[15px] font-semibold leading-snug text-foreground">
                    {faq.question}
                  </dt>
                  <dd className="mt-3 text-pretty text-[15px] leading-[1.65] text-muted-foreground">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {verwandte.length > 0 && (
          <nav className="mt-14 border-t border-border pt-10" aria-label="Verwandte Begriffe">
            <h2 className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Verwandte Begriffe
            </h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {verwandte.map((eintrag) => (
                <li key={eintrag.slug}>
                  <Link
                    href={`/glossar/${eintrag.slug}`}
                    className="inline-flex border border-border px-3 py-2 text-[13px] text-foreground/85 transition-colors hover:border-primary hover:text-primary"
                  >
                    {eintrag.term}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </article>

      <CtaBanner
        heading="Theorie hilft nur bis zur ersten Umsetzung."
        text="Dreißig Minuten an einem echten Prozess bringen mehr als jede Definition."
        position={`glossar-${term.slug}`}
      />
    </PageShell>
  );
}
