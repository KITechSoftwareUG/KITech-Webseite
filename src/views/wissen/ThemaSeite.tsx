import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER, TEXT_CONTAINER } from "@/components/layout/site-container";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { StructuredData, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { BASE_URL } from "@/lib/metadata";
import type { Artikel, Cluster } from "@/lib/wissen/schema";
import { clusterSchema } from "@/lib/wissen/schema-org";

/**
 * Themen-Hub unter `/gratis-wissen/thema/<slug>`.
 *
 * **Warum es diese Seiten gibt.** Bei täglicher Veröffentlichung entstehen
 * verwaiste Artikel systematisch: Beitrag Nummer eins steht nach vierzig Tagen
 * auf Seite drei der Übersicht und hat dann keinen einzigen internen Link mehr
 * aus einem Fließtext. Über die Sitemap bleibt er auffindbar — aber eine Sitemap
 * überträgt kein Gewicht, sie meldet nur Existenz.
 *
 * Der Hub ist die Gegenmaßnahme. Er verlinkt jeden Artikel seines Themas, wird
 * von jedem Artikel zurückverlinkt und hält damit die Klicktiefe bei zwei. John
 * Mueller zur Struktur: „it's more a matter of how many links you have to click
 * through to actually get to that content rather than what the URL structure
 * itself looks like."
 *
 * **Ein Hub ohne eigenen Text wäre eine Linkliste.** Deshalb ist `einleitung`
 * im Schema Pflicht und mindestens zwei Absätze lang: Die Seite soll selbst für
 * ihr Pillar-Keyword ranken können, nicht nur weiterleiten.
 */
export default function ThemaSeite({
  cluster,
  artikel,
  andereThemen,
}: {
  cluster: Cluster;
  artikel: Artikel[];
  andereThemen: Cluster[];
}) {
  return (
    <PageShell backdrop="none">
      <StructuredData
        data={[
          clusterSchema(cluster, artikel),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Gratis-Wissen", url: `${BASE_URL}/gratis-wissen` },
            { name: cluster.titel, url: `${BASE_URL}/gratis-wissen/thema/${cluster.slug}` },
          ]),
        ]}
      />

      <header className="bg-surface-strong">
        <div className={`${TEXT_CONTAINER} py-14 sm:py-20`}>
          <Link
            href="/gratis-wissen"
            className="inline-flex items-center gap-2 text-mini font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Gratis-Wissen
          </Link>

          <h1 className="kinetic-display kinetic-morph-in mt-7 text-balance text-[32px] leading-[1.12] text-foreground sm:text-[44px]">
            {cluster.titel}
          </h1>

          <div className="mt-7 space-y-4 text-pretty text-lead leading-[1.55] text-foreground/85">
            {cluster.einleitung.map((absatz) => (
              <p key={absatz}>{absatz}</p>
            ))}
          </div>
        </div>
      </header>

      <section className={`${SITE_CONTAINER} py-14 sm:py-16`} aria-labelledby="artikel">
        <h2 id="artikel" className="kinetic-display text-[24px] leading-[1.2] text-foreground sm:text-[28px]">
          {artikel.length === 1 ? "Ein Artikel zum Thema" : `${artikel.length} Artikel zum Thema`}
        </h2>

        <ul className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
          {artikel.map((eintrag) => (
            <li key={eintrag.slug} className="bg-background">
              <Link
                href={`/gratis-wissen/${eintrag.slug}`}
                className="group flex h-full flex-col p-7 transition-colors hover:bg-foreground/[0.03] sm:p-8"
              >
                <span className="inline-flex items-center gap-1.5 text-mini text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {eintrag.lesezeit} Min.
                </span>

                <h3 className="kinetic-display mt-4 text-balance text-[21px] leading-[1.18] text-foreground sm:text-[24px]">
                  {eintrag.titel}
                </h3>

                <p className="mt-4 flex-1 text-pretty text-fliess leading-[1.6] text-muted-foreground">
                  {eintrag.teaser}
                </p>

                <span className="mt-6 inline-flex items-center gap-2 text-fliess font-bold text-primary">
                  Lesen
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

      {andereThemen.length > 0 && (
        <section className={`${SITE_CONTAINER} pb-14`} aria-labelledby="andere-themen">
          <h2
            id="andere-themen"
            className="text-mini font-bold uppercase tracking-wide text-muted-foreground"
          >
            Andere Themen
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {andereThemen.map((eintrag) => (
              <li key={eintrag.slug}>
                <Link
                  href={`/gratis-wissen/thema/${eintrag.slug}`}
                  className="inline-block border border-border px-4 py-2 text-[15px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {eintrag.titel}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <CtaBanner
        heading="Lesen hilft. Anfangen hilft mehr."
        text={`Im 1:1-KI-Check gehen wir einen konkreten Ablauf bei dir durch, statt allgemein über ${cluster.titel.toLowerCase()} zu reden.`}
        position={`wissen-thema-${cluster.slug}`}
      />
    </PageShell>
  );
}
