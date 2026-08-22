import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Linkedin, Mail } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER, TEXT_CONTAINER } from "@/components/layout/site-container";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { StructuredData, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { BASE_URL } from "@/lib/metadata";
import type { Artikel, Autor } from "@/lib/wissen/schema";
import { profilePageSchema } from "@/lib/wissen/schema-org";

/**
 * Autorenseite unter `/autoren/<slug>`.
 *
 * **Der einzige Ort, an dem strukturierte Daten für diesen Blog noch Substanz
 * tragen.** Google empfiehlt für die `author`-Eigenschaft ausdrücklich `type`
 * und `url` beziehungsweise `sameAs` — und wörtlich: „If the URL is an internal
 * profile page, we recommend marking up that author using profile page
 * structured data." `ProfilePage` hat, anders als `Article`, ein echtes
 * Pflichtfeld (`mainEntity`).
 *
 * **Warum es die Seite überhaupt braucht.** Googles Prüfliste für hilfreiche
 * Inhalte fragt: „Do bylines lead to further information about the author?"
 * Eine Byline, die auf nichts führt, beantwortet die Frage mit nein. Und in der
 * Bewertungsanleitung steht als Kern von E-E-A-T „first-hand or life
 * experience" — das lässt sich nur an einer benannten Person festmachen, nicht
 * an einer Firma.
 *
 * **Nie ein Modell als Autor.** Google rät davon ausdrücklich ab: „Giving AI an
 * author byline is probably not the best way to follow our recommendation to
 * make clear to readers when AI is part of the content creation process."
 * Deshalb prüft das Schema den Autor gegen `content/seo/autoren.json` — es gibt
 * keinen Weg, einen Artikel ohne benannten Menschen zu veröffentlichen.
 */
export default function AutorSeite({
  autor,
  artikel,
}: {
  autor: Autor;
  artikel: Artikel[];
}) {
  return (
    <PageShell backdrop="none">
      <StructuredData
        data={[
          profilePageSchema(autor, artikel.length),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Autoren", url: `${BASE_URL}/autoren` },
            { name: autor.name, url: `${BASE_URL}/autoren/${autor.slug}` },
          ]),
        ]}
      />

      <header className="bg-surface-strong">
        <div className={`${TEXT_CONTAINER} py-14 sm:py-20`}>
          <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-9">
            {autor.bild && (
              <Image
                src={autor.bild}
                alt={autor.name}
                width={140}
                height={140}
                priority
                className="h-32 w-32 shrink-0 object-cover sm:h-36 sm:w-36"
              />
            )}

            <div className="min-w-0">
              <h1 className="kinetic-display kinetic-morph-in text-balance text-[32px] leading-[1.12] text-foreground sm:text-[40px]">
                {autor.name}
              </h1>
              <p className="mt-2 text-[17px] text-muted-foreground">{autor.rolle}</p>

              <div className="mt-5 flex flex-wrap gap-4">
                {autor.linkedinUrl && (
                  <a
                    href={autor.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-mini font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                    LinkedIn
                  </a>
                )}
                {autor.email && (
                  <a
                    href={`mailto:${autor.email}`}
                    className="inline-flex items-center gap-2 text-mini font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {autor.email}
                  </a>
                )}
              </div>
            </div>
          </div>

          <p className="mt-9 text-pretty text-lead leading-[1.55] text-foreground/85">
            {autor.kurzbeschreibung}
          </p>

          <div className="mt-8">
            <h2 className="text-mini font-bold uppercase tracking-wide text-muted-foreground">
              Themen
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {autor.themen.map((thema) => (
                <li
                  key={thema}
                  className="border border-border px-3 py-1.5 text-[14px] text-muted-foreground"
                >
                  {thema}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <section className={`${SITE_CONTAINER} py-14 sm:py-16`} aria-labelledby="beitraege">
        <h2 id="beitraege" className="kinetic-display text-[24px] leading-[1.2] text-foreground sm:text-[28px]">
          {artikel.length === 0
            ? "Noch keine Beiträge"
            : artikel.length === 1
              ? "Ein Beitrag"
              : `${artikel.length} Beiträge`}
        </h2>

        {artikel.length > 0 && (
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {artikel.map((eintrag) => (
              <li key={eintrag.slug}>
                <Link
                  href={`/gratis-wissen/${eintrag.slug}`}
                  className="group flex flex-col gap-2 py-6 transition-colors hover:bg-foreground/[0.02] sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <span className="min-w-0">
                    <span className="block text-[18px] font-bold leading-[1.3] text-foreground">
                      {eintrag.titel}
                    </span>
                    <span className="mt-2 block text-pretty text-[15px] leading-[1.6] text-muted-foreground">
                      {eintrag.teaser}
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-2 text-mini text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {eintrag.lesezeit} Min.
                    <ArrowRight
                      className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CtaBanner
        heading="Lieber direkt fragen?"
        text={`Im 1:1-KI-Check redest du eine halbe Stunde mit ${autor.name.split(" ")[0]} über einen konkreten Ablauf bei dir.`}
        position={`autor-${autor.slug}`}
      />
    </PageShell>
  );
}
