import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { buildMetadata, BASE_URL } from "@/lib/metadata";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER, TEXT_CONTAINER } from "@/components/layout/site-container";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { StructuredData, getWebPageSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { alleAutoren, artikelVonAutor } from "@/lib/wissen/laden";

export const metadata = buildMetadata({
  title: "Wer hier schreibt – KITech Software",
  description:
    "Die Menschen hinter den Artikeln im Gratis-Wissen: Rolle, Hintergrund und die Themen, zu denen sie aus eigener Projektarbeit schreiben.",
  path: "/autoren",
});

/**
 * `/autoren` — die Übersicht über die Autorenseiten.
 *
 * Sie existiert aus zwei Gründen. Erstens verlangt der Routen-Test, dass jede
 * öffentliche Route von irgendwo aus erreichbar ist; ohne diese Seite hingen die
 * einzelnen Profile nur an den Artikeln. Zweitens ist sie die Antwort auf
 * Googles Prüffrage nach „background about the author or the site that publishes
 * it" — ein Ort, an dem steht, wer hier schreibt und warum ausgerechnet diese
 * Person.
 */
export default function Page() {
  const autoren = alleAutoren();

  return (
    <PageShell backdrop="none">
      <StructuredData
        data={[
          getWebPageSchema(
            "Wer hier schreibt",
            "Die Menschen hinter den Artikeln im Gratis-Wissen von KITech Software.",
            `${BASE_URL}/autoren`
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Autoren", url: `${BASE_URL}/autoren` },
          ]),
        ]}
      />

      <header className="bg-surface-strong">
        <div className={`${TEXT_CONTAINER} py-14 text-center sm:py-20`}>
          <h1 className="kinetic-display kinetic-morph-in text-balance text-[32px] leading-[1.12] text-foreground sm:text-[44px]">
            Wer hier schreibt
          </h1>
          <p className="mx-auto mt-6 max-w-[560px] text-pretty text-lead leading-[1.55] text-foreground/85">
            Jeder Artikel trägt einen Namen. Wer wissen will, woher eine Einschätzung kommt, findet
            hier den Hintergrund dazu.
          </p>
        </div>
      </header>

      <section className={`${SITE_CONTAINER} py-14 sm:py-16`} aria-labelledby="autoren">
        <h2 id="autoren" className="sr-only">
          Alle Autoren
        </h2>

        <ul className="grid gap-px border border-border bg-border sm:grid-cols-2">
          {autoren.map((autor) => {
            const anzahl = artikelVonAutor(autor.slug).length;

            return (
              <li key={autor.slug} className="bg-background">
                <Link
                  href={`/autoren/${autor.slug}`}
                  className="group flex h-full flex-col p-7 transition-colors hover:bg-foreground/[0.03] sm:p-8"
                >
                  <div className="flex items-center gap-5">
                    {autor.bild && (
                      <Image
                        src={autor.bild}
                        alt=""
                        width={72}
                        height={72}
                        className="h-18 w-18 shrink-0 object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <span className="block text-[20px] font-bold leading-tight text-foreground">
                        {autor.name}
                      </span>
                      <span className="mt-1 block text-mini text-muted-foreground">
                        {autor.rolle}
                      </span>
                    </div>
                  </div>

                  <p className="mt-5 flex-1 text-pretty text-[15px] leading-[1.65] text-muted-foreground">
                    {autor.kurzbeschreibung}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 text-mini font-bold text-primary">
                    {anzahl === 0 ? "Profil ansehen" : anzahl === 1 ? "1 Beitrag" : `${anzahl} Beiträge`}
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <CtaBanner
        heading="Lieber direkt fragen als lesen?"
        text="Im 1:1-KI-Check geht es eine halbe Stunde lang nur um einen konkreten Ablauf bei dir."
        position="autoren"
      />
    </PageShell>
  );
}
