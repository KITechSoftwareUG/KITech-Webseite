import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import {
  StructuredData,
  getBreadcrumbSchema,
  getWebPageSchema,
} from "@/components/seo/StructuredData";
import { glossaryTerms } from "@/data/glossary";

export default function Glossar() {
  const schema = [
    getWebPageSchema(
      "Glossar – KI-Begriffe verständlich erklärt",
      "Glossar mit klar definierten Fachbegriffen rund um KI, ROI-Garantie, KI-Audit und DSGVO-konforme KI-Systeme.",
      "https://kitech-software.de/glossar"
    ),
    getBreadcrumbSchema([
      { name: "Start", url: "https://kitech-software.de/" },
      { name: "Glossar", url: "https://kitech-software.de/glossar" },
    ]),
    {
      "@context": "https://schema.org" as const,
      "@type": "DefinedTermSet",
      "@id": "https://kitech-software.de/glossar",
      name: "KITech KI-Glossar",
      url: "https://kitech-software.de/glossar",
      inLanguage: "de-DE",
      hasDefinedTerm: glossaryTerms.map((t) => ({
        "@type": "DefinedTerm",
        name: t.term,
        description: t.shortDefinition,
        url: `https://kitech-software.de/glossar/${t.slug}`,
        inDefinedTermSet: { "@id": "https://kitech-software.de/glossar" },
      })),
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Glossar – KI-Begriffe verständlich | KITech Software"
        description="Glossar mit Fachbegriffen rund um KI mit ROI-Garantie: ROI-Garantie, KI-Audit, LLM-Integration, DSGVO-konforme KI, MLOps und Computer Vision."
        canonical="/glossar"
      />
      <StructuredData data={schema} />

      <section className="container py-20 md:py-28">
        <nav aria-label="Brotkrume" className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Start</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Glossar</span>
        </nav>

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            Wissen kompakt
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
            Glossar – KI-Begriffe verständlich erklärt
          </h1>
          <p className="text-lg text-muted-foreground font-thin">
            Klare Definitionen rund um KI mit ROI-Garantie. Ohne Marketing-Floskeln,
            ohne Buzzwords – nur belastbare Erklärungen für Entscheiderinnen und
            Entscheider im Mittelstand.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 md:grid-cols-2">
          {glossaryTerms.map((t) => (
            <li key={t.slug}>
              <Link
                to={`/glossar/${t.slug}`}
                className="group block h-full rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
              >
                <h2 className="text-xl font-light text-foreground mb-2 group-hover:text-primary transition-colors">
                  {t.term}
                </h2>
                <p className="text-sm text-muted-foreground font-thin mb-4">
                  {t.shortDefinition}
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-primary">
                  Weiterlesen <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
