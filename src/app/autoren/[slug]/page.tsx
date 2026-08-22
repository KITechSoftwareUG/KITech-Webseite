import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata, kuerze } from "@/lib/metadata";
import { alleAutoren, artikelVonAutor, autorNachSlug } from "@/lib/wissen/laden";
import AutorSeite from "@/views/wissen/AutorSeite";

interface AutorPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return alleAutoren().map((autor) => ({ slug: autor.slug }));
}

export async function generateMetadata({ params }: AutorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const autor = autorNachSlug(slug);

  if (!autor) {
    return buildMetadata({
      title: "Autor nicht gefunden – KITech Software",
      description: "Diese Seite gibt es nicht (mehr).",
      path: `/autoren/${slug}`,
      noindex: true,
    });
  }

  /* `kuerze` statt `slice(0, 200)`: Das harte Abschneiden lag über der
     Kürzungsgrenze und traf mitten ins Wort. */
  return buildMetadata({
    title: `${autor.name} – ${autor.rolle}`,
    description: kuerze(autor.kurzbeschreibung),
    path: `/autoren/${autor.slug}`,
    ogType: "article",
  });
}

export default async function Page({ params }: AutorPageProps) {
  const { slug } = await params;
  const autor = autorNachSlug(slug);

  if (!autor) {
    notFound();
  }

  return <AutorSeite autor={autor} artikel={artikelVonAutor(autor.slug)} />;
}
