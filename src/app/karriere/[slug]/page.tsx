import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import { jobs, getJobBySlug } from "@/data/jobs";
import KarriereJob from "@/views/KarriereJob";

interface JobPageProps {
  /** Seit Next.js 15 kommen die Route-Parameter als Promise herein. */
  params: Promise<{ slug: string }>;
}

/**
 * Alle Stellen stehen zur Bauzeit fest, also werden alle Seiten vorgerendert.
 *
 * `dynamicParams = false` schließt aus, dass ein unbekannter Slug zur Laufzeit
 * gerendert wird — alles andere bekommt direkt eine 404 statt einer leeren Seite
 * mit Status 200.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug);

  if (!job) {
    return buildMetadata({
      title: "Stelle nicht gefunden – KITech Software",
      description: "Diese Stelle gibt es nicht (mehr).",
      path: `/karriere/${slug}`,
      noindex: true,
    });
  }

  return buildMetadata({
    title: `${job.title} – Karriere bei KITech Software`,
    description: job.teaser,
    path: `/karriere/${job.slug}`,
    // Platzhalter-Stelle: nicht in den Index. Siehe Kopf von src/data/jobs.ts.
    noindex: Boolean(job.isPlaceholder),
  });
}

export default async function Page({ params }: JobPageProps) {
  const { slug } = await params;
  const job = getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  return <KarriereJob job={job} />;
}
