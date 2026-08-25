import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { StructuredData, getWebPageSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { BASE_URL } from "@/lib/metadata";
import type { Artikel, Cluster } from "@/lib/wissen/schema";

/**
 * `/gratis-wissen` — der Einstieg in den Content-Bereich.
 *
 * **Themen zuerst, dann die neuesten Artikel.** Bei drei Artikeln war eine
 * Liste die richtige Darstellung. Ab dreißig ist sie eine Sackgasse: Was älter
 * ist als zwei Wochen, verschwindet nach unten und ist danach nur noch über die
 * Suche erreichbar. Die Themenkacheln oben halten jeden Artikel bei zwei Klicks
 * von hier — und geben dem Bereich eine Ordnung, die auch für jemanden lesbar
 * ist, der nicht weiß, wonach er sucht.
 *
 * Server Component: reine Textseite, nichts davon ist interaktiv.
 */
export default function UebersichtSeite({
  cluster,
  neueste,
  anzahlProCluster,
  gesamt,
}: {
  /** Nur Themen mit mindestens einem veröffentlichten Artikel. */
  cluster: Cluster[];
  /** Die letzten Artikel, absteigend nach Datum. */
  neueste: Artikel[];
  anzahlProCluster: Record<string, number>;
  gesamt: number;
}) {
  return (
    <PageShell backdrop="none">
      <StructuredData
        data={[
          getWebPageSchema(
            "Gratis-Wissen",
            "Artikel, Tipps und Ratgeber rund um KI im Mittelstand — kostenlos und ohne Anmeldung.",
            `${BASE_URL}/gratis-wissen`
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Gratis-Wissen", url: `${BASE_URL}/gratis-wissen` },
          ]),
        ]}
      />

      <section className="bg-surface-strong">
        <div className={`${SITE_CONTAINER} py-16 text-center sm:py-20`}>
          {/* Die H1 hieß bis zum 24.08.2026 „Gratis-Wissen" — der Name des
              Bereichs, aber kein Begriff, nach dem jemand sucht. Die wichtigste
              Überschrift der Hub-Seite stand damit auf einem Wort ohne
              Suchvolumen, während der Seitentitel im Kopf längst „KI im
              Mittelstand" trug. Der Bereichsname bleibt in Navigation,
              Brotkrume und Adresse; hier steht jetzt, worum es geht. */}
          <h1 className="kinetic-morph-in mx-auto max-w-[860px] text-balance text-[34px] font-extrabold uppercase leading-[1.08] tracking-tight text-foreground sm:text-[46px] sm:leading-[53px]">
            KI im Mittelstand: was funktioniert, was Geld kostet.
          </h1>
          <p className="mx-auto mt-6 max-w-[620px] text-pretty text-[18px] font-normal leading-[27px] text-foreground dt:text-subline">
            Tipps, Ratgeber und die Fehler, die fast jeder mit KI macht. Ohne Anmeldung, ohne
            E-Mail-Adresse, ohne Gegenleistung.
          </p>
        </div>
      </section>

      {cluster.length > 0 && (
        <section className={`${SITE_CONTAINER} py-14 sm:py-16`} aria-labelledby="themen">
          <h2 id="themen" className="kinetic-display text-[24px] leading-[1.2] text-foreground sm:text-[28px]">
            Themen
          </h2>

          <ul className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {cluster.map((eintrag) => (
              <li key={eintrag.slug} className="bg-background">
                <Link
                  href={`/gratis-wissen/thema/${eintrag.slug}`}
                  className="group flex h-full flex-col p-7 transition-colors hover:bg-foreground/[0.03]"
                >
                  <span className="kinetic-display text-[19px] leading-[1.2] text-foreground">
                    {eintrag.titel}
                  </span>
                  <span className="mt-3 flex-1 text-pretty text-[15px] leading-[1.6] text-muted-foreground">
                    {eintrag.teaser}
                  </span>
                  <span className="mt-5 inline-flex items-center gap-2 text-mini font-bold text-primary">
                    {anzahlProCluster[eintrag.slug] === 1
                      ? "1 Artikel"
                      : `${anzahlProCluster[eintrag.slug]} Artikel`}
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={`${SITE_CONTAINER} pb-14 sm:pb-16`} aria-labelledby="neueste">
        <h2 id="neueste" className="kinetic-display text-[24px] leading-[1.2] text-foreground sm:text-[28px]">
          {gesamt === 1 ? "Der Artikel" : "Zuletzt erschienen"}
        </h2>

        {/* Trennlinien-Raster statt einzelner Karten — dieselbe Sprache wie im
            Glossar. Bei ungerader Artikelzahl nimmt der letzte Eintrag beide
            Spalten: sonst bleibt rechts daneben eine Zelle in der Rahmenfarbe
            stehen, und die liest sich wie ein Darstellungsfehler. */}
        <ul className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
          {neueste.map((artikel) => (
            <li key={artikel.slug} className="bg-background">
              <Link
                href={`/gratis-wissen/${artikel.slug}`}
                className="group flex h-full flex-col p-7 transition-colors hover:bg-foreground/[0.03] sm:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-primary px-3 py-1 text-mini font-bold uppercase tracking-wide text-primary-foreground">
                    {artikel.kategorie}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-mini text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {artikel.lesezeit} Min.
                  </span>
                </div>

                <h3 className="kinetic-display mt-5 text-balance text-[22px] leading-[1.15] text-foreground sm:text-[25px]">
                  {artikel.titel}
                </h3>

                <p className="mt-4 flex-1 text-pretty text-fliess leading-[1.6] text-muted-foreground">
                  {artikel.teaser}
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

      <CtaBanner
        heading="Steht dein Fall nicht dabei?"
        text="Im 1:1-KI-Check gehen wir genau deinen Ablauf durch, statt allgemein über KI zu reden."
        position="gratis-wissen"
      />
    </PageShell>
  );
}
