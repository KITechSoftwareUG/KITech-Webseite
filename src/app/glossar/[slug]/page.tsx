import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import { glossaryTerms, getTermBySlug } from "@/data/glossary";
import GlossarTerm from "@/views/GlossarTerm";

interface GlossarTermPageProps {
  /** Seit Next.js 15 kommen die Route-Parameter als Promise herein. */
  params: Promise<{ slug: string }>;
}

/**
 * Alle Begriffe stehen zur Bauzeit fest, also werden alle Seiten vorgerendert.
 * Genau dafür ist der Umzug auf Next.js gemacht worden: Glossarartikel sind die
 * Seiten, die organisch ranken sollen, und dafür braucht der Crawler fertiges
 * HTML statt einer nachgeladenen SPA-Route.
 *
 * `dynamicParams = false` schließt aus, dass ein unbekannter Slug zur Laufzeit
 * gerendert wird — alles andere bekommt direkt eine 404 statt einer leeren Seite
 * mit Status 200.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return glossaryTerms.map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({ params }: GlossarTermPageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = getTermBySlug(slug);

  if (!term) {
    return buildMetadata({
      title: "Begriff nicht gefunden – KITech Software",
      description: "Diesen Begriff gibt es im Glossar nicht (mehr).",
      path: `/glossar/${slug}`,
      noindex: true,
    });
  }

  return buildMetadata({
    title: `${term.term} – Definition | KITech Software`,
    description: term.metaDescription,
    path: `/glossar/${term.slug}`,
    ogType: "article",
  });
}

export default async function Page({ params }: GlossarTermPageProps) {
  const { slug } = await params;
  const term = getTermBySlug(slug);

  if (!term) {
    notFound();
  }

  return <GlossarTerm term={term} />;
}
