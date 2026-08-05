import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import { clientResults, type ClientResult } from "@/data/client-results";
import ReferenzDetail from "@/views/ReferenzDetail";

interface ReferenzDetailPageProps {
  /** Seit Next.js 15 kommen die Route-Parameter als Promise herein. */
  params: Promise<{ slug: string }>;
}

/**
 * Alle Fälle stehen zur Bauzeit fest, also werden alle Seiten vorgerendert — genau
 * der Grund für den Umzug auf Next.js: die Fälle sollen organisch ranken, und dafür
 * braucht der Crawler fertiges HTML statt einer nachgeladenen SPA-Route.
 *
 * `dynamicParams = false` schließt aus, dass ein unbekannter Slug zur Laufzeit
 * gerendert wird. Damit bleibt die Route vollständig statisch und liefert für alles
 * andere direkt 404 — statt eine leere Seite mit 200 auszuliefern, die Google indexiert.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return clientResults.map((result) => ({ slug: result.slug }));
}

function findResult(slug: string): ClientResult | undefined {
  return clientResults.find((result) => result.slug === slug);
}

export async function generateMetadata({
  params,
}: ReferenzDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = findResult(slug);

  if (!result) {
    return buildMetadata({
      title: "Kundenfall nicht gefunden – KITech Software",
      description: "Diesen Kundenfall gibt es nicht (mehr).",
      path: `/referenzen/${slug}`,
      noindex: true,
    });
  }

  return buildMetadata({
    // Titel trägt die Kernzahl, weil sie das einzige ist, wonach jemand sucht.
    title: `${result.company}: ${result.headline.value} ${result.headline.label} – KITech Software`,
    description: result.detail?.intro ?? result.summary,
    path: `/referenzen/${result.slug}`,
    ogType: "article",
    // Zwei Gründe für noindex, beide aus der Datendatei ableitbar:
    //   1. keine Langfassung -> die Seite hat nichts, was einen Suchtreffer rechtfertigt
    //   2. offene Punkte     -> laut Kommentar in client-results.ts heisst "leere
    //      openPoints = freigegeben". Solange dort etwas steht, ist der Fall weder
    //      inhaltlich fertig noch vom Kunden freigegeben, und Platzhaltertext gehoert
    //      nicht in den Index. Sobald die Punkte geleert sind, wird die Seite beim
    //      naechsten Build automatisch indexierbar — hier ist nichts nachzupflegen.
    noindex: !result.detail || Boolean(result.openPoints?.length),
  });
}

export default async function Page({ params }: ReferenzDetailPageProps) {
  const { slug } = await params;
  const result = findResult(slug);

  if (!result) {
    notFound();
  }

  // Der nächste Fall läuft im Kreis, damit auch der letzte Eintrag weiterführt.
  const index = clientResults.findIndex((entry) => entry.slug === result.slug);
  const nextResult =
    clientResults.length > 1 ? clientResults[(index + 1) % clientResults.length] : null;

  return <ReferenzDetail result={result} nextResult={nextResult} />;
}
