import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import { wissenArtikel, wissenArtikelSortiert, getArtikelBySlug } from "@/data/wissen";
import WissenArtikel from "@/views/WissenArtikel";

interface ArtikelPageProps {
  /** Seit Next.js 15 kommen die Route-Parameter als Promise herein. */
  params: Promise<{ slug: string }>;
}

/**
 * Alle Artikel stehen zur Bauzeit fest und werden vorgerendert — genau dafür
 * ist der Umzug auf Next.js gemacht worden: Diese Seiten sollen organisch
 * ranken, und dafür braucht der Crawler fertiges HTML.
 *
 * `dynamicParams = false`: ein unbekannter Slug bekommt eine 404 statt einer
 * leeren Seite mit Status 200.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return wissenArtikel.map((artikel) => ({ slug: artikel.slug }));
}

export async function generateMetadata({ params }: ArtikelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artikel = getArtikelBySlug(slug);

  if (!artikel) {
    return buildMetadata({
      title: "Artikel nicht gefunden – KITech Software",
      description: "Diesen Artikel gibt es nicht (mehr).",
      path: `/gratis-wissen/${slug}`,
      noindex: true,
    });
  }

  return buildMetadata({
    title: `${artikel.titel} – KITech Software`,
    description: artikel.teaser,
    path: `/gratis-wissen/${artikel.slug}`,
    ogType: "article",
  });
}

export default async function Page({ params }: ArtikelPageProps) {
  const { slug } = await params;
  const artikel = getArtikelBySlug(slug);

  if (!artikel) {
    notFound();
  }

  /* Der nächste Artikel in der Übersichtsreihenfolge, umlaufend — so endet
     keine Artikelseite in einer Sackgasse. */
  const index = wissenArtikelSortiert.findIndex((eintrag) => eintrag.slug === artikel.slug);
  const naechster =
    wissenArtikelSortiert.length > 1
      ? wissenArtikelSortiert[(index + 1) % wissenArtikelSortiert.length]
      : null;

  return <WissenArtikel artikel={artikel} naechster={naechster} />;
}
