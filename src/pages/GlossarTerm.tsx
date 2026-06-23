import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import {
  StructuredData,
  getBreadcrumbSchema,
  getFAQSchema,
} from "@/components/seo/StructuredData";
import { getTermBySlug, glossaryTerms } from "@/data/glossary";

export default function GlossarTerm() {
  const { slug } = useParams<{ slug: string }>();
  const term = slug ? getTermBySlug(slug) : undefined;

  if (!term) return <Navigate to="/glossar" replace />;

  const url = `https://kitech-software.de/glossar/${term.slug}`;
  const related = term.related
    .map((s) => glossaryTerms.find((t) => t.slug === s))
    .filter((t): t is (typeof glossaryTerms)[number] => Boolean(t));

  const schema = [
    {
      "@context": "https://schema.org" as const,
      "@type": "Article",
      headline: term.term,
      description: term.metaDescription,
      mainEntityOfPage: url,
      url,
      inLanguage: "de-DE",
      author: {
        "@type": "Organization",
        name: "KITech Software UG (haftungsbeschränkt)",
        url: "https://kitech-software.de",
      },
      publisher: {
        "@type": "Organization",
        name: "KITech Software UG (haftungsbeschränkt)",
        logo: {
          "@type": "ImageObject",
          url: "https://kitech-software.de/logo.png",
        },
      },
      about: {
        "@type": "DefinedTerm",
        name: term.term,
        description: term.shortDefinition,
        inDefinedTermSet: "https://kitech-software.de/glossar",
      },
    },
    getBreadcrumbSchema([
      { name: "Start", url: "https://kitech-software.de/" },
      { name: "Glossar", url: "https://kitech-software.de/glossar" },
      { name: term.term, url },
    ]),
    ...(term.faqs && term.faqs.length > 0 ? [getFAQSchema(term.faqs)] : []),
  ];

  return (
    <Layout>
      <SEOHead
        title={`${term.term} – Definition & Bedeutung | KITech Software`}
        description={term.metaDescription}
        canonical={`/glossar/${term.slug}`}
        ogType="article"
      />
      <StructuredData data={schema} />

      <article className="container py-20 md:py-28">
        <nav aria-label="Brotkrume" className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Start</Link>
          <span className="mx-2">/</span>
          <Link to="/glossar" className="hover:text-primary">Glossar</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{term.term}</span>
        </nav>

        <header className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
            {term.term}
          </h1>
          <p className="text-lg text-muted-foreground font-thin">
            {term.shortDefinition}
          </p>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_280px]">
          <div className="max-w-3xl space-y-10">
            {term.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="text-2xl font-light text-foreground mb-3">
                  {s.heading}
                </h2>
                <p className="text-base text-muted-foreground font-thin leading-relaxed">
                  {s.content}
                </p>
              </section>
            ))}

            {term.faqs && term.faqs.length > 0 && (
              <section>
                <h2 className="text-2xl font-light text-foreground mb-4">
                  Häufige Fragen
                </h2>
                <dl className="space-y-6">
                  {term.faqs.map((f) => (
                    <div key={f.question}>
                      <dt className="font-light text-foreground mb-1">
                        {f.question}
                      </dt>
                      <dd className="text-muted-foreground font-thin">
                        {f.answer}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <h2 className="text-xl font-light text-foreground mb-2">
                {term.term} in Ihrem Unternehmen?
              </h2>
              <p className="text-muted-foreground font-thin mb-4">
                Wir prüfen im KI-Audit, ob und wie sich {term.term} für Ihre
                Prozesse rechnet – inklusive ROI-Garantie.
              </p>
              <Link
                to="/kontakt"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Erstgespräch vereinbaren <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Verwandte Begriffe
            </h3>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={`/glossar/${r.slug}`}
                    className="group block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
                  >
                    <div className="font-light text-foreground group-hover:text-primary transition-colors">
                      {r.term}
                    </div>
                    <div className="text-xs text-muted-foreground font-thin mt-1 line-clamp-2">
                      {r.shortDefinition}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/glossar"
              className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Alle Begriffe
            </Link>
          </aside>
        </div>
      </article>
    </Layout>
  );
}
