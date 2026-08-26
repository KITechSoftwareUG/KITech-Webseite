import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata, kuerze } from "@/lib/metadata";
import {
  artikelImCluster,
  artikelNachSlug,
  autorNachSlug,
  clusterNachSlug,
  veroeffentlichteArtikel,
} from "@/lib/wissen/laden";
import ArtikelSeite from "@/views/wissen/ArtikelSeite";

interface ArtikelPageProps {
  /** Seit Next.js 15 kommen die Route-Parameter als Promise herein. */
  params: Promise<{ slug: string }>;
}

/**
 * `dynamicParams = false`: ein unbekannter Slug bekommt eine 404 statt einer
 * leeren Seite mit Status 200.
 *
 * ⚠️ **Das ist die Stelle, die beim Wachsen angefasst werden muss.** Solange die
 * Artikel als Dateien im Repo liegen und über einen Deploy live gehen, ist
 * vollständiges Vorrendern richtig und schnell. Ab etwa 500 Artikeln wird der
 * Build spürbar länger, ab etwa 1.000 unangenehm. Dann gilt:
 *
 *   export const dynamicParams = true
 *   export const revalidate = 3600
 *   export function generateStaticParams() {
 *     return veroeffentlichteArtikel().slice(0, 200).map((a) => ({ slug: a.slug }))
 *   }
 *
 * Neue Artikel werden dann beim ersten Aufruf gerendert und danach zwischen-
 * gespeichert. Zwei Dinge sind dabei zu wissen: `generateStaticParams` läuft bei
 * einer Neuvalidierung **nicht** erneut — neue Seiten kommen ausschließlich über
 * `dynamicParams` herein. Und der Zwischenspeicher liegt im Dateisystem des
 * Containers, ist nach jedem Coolify-Deploy also leer. Bei einer Instanz ist das
 * unkritisch; bei mehreren bräuchte es einen gemeinsamen `cacheHandler`.
 *
 * Bei drei Artikeln pro Tag ist die 500er-Marke in gut fünf Monaten erreicht.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return veroeffentlichteArtikel().map((artikel) => ({ slug: artikel.slug }));
}

export async function generateMetadata({ params }: ArtikelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artikel = artikelNachSlug(slug);

  if (!artikel) {
    return buildMetadata({
      title: "Artikel nicht gefunden – KITech Software",
      description: "Diesen Artikel gibt es nicht (mehr).",
      path: `/gratis-wissen/${slug}`,
      noindex: true,
    });
  }

  /* Ohne den Zusatz „– KITech Software" (20.08.2026). Artikelüberschriften sind
     schon 45 bis 60 Zeichen lang; die 18 Zeichen Firmenname schoben sie über die
     Kürzungsgrenze, und abgeschnitten wurde dann der Firmenname — er stand also
     nirgends und kostete trotzdem den halben Titel. Der Absender steht in der
     Ergebniszeile ohnehin über die Domain. */
  return buildMetadata({
    /* `metaTitel` schlaegt `titel`, wo die Ueberschrift laenger sein darf als
       das Suchergebnis breit ist. Siehe schema.ts. */
    title: artikel.metaTitel ?? artikel.titel,
    description: kuerze(artikel.teaser),
    path: `/gratis-wissen/${artikel.slug}`,
    ogType: "article",
    publishedTime: artikel.datum,
    modifiedTime: artikel.aktualisiert,
    authors: [autorNachSlug(artikel.autor)?.name ?? artikel.autor],
  });
}

export default async function Page({ params }: ArtikelPageProps) {
  const { slug } = await params;
  const artikel = artikelNachSlug(slug);

  if (!artikel) {
    notFound();
  }

  const autor = autorNachSlug(artikel.autor);
  const cluster = clusterNachSlug(artikel.cluster);

  /* Beides ist vom Loader bereits geprüft — er bricht den Build ab, wenn ein
     Artikel auf einen unbekannten Autor oder ein unbekanntes Thema zeigt. Die
     Abfrage steht hier nur, damit TypeScript den Fall nicht offen lässt. */
  if (!autor || !cluster) {
    notFound();
  }

  const imThema = artikelImCluster(artikel.cluster)
    .filter((eintrag) => eintrag.slug !== artikel.slug)
    .slice(0, 3);

  /* Der nächste Artikel in der Gesamtreihenfolge, umlaufend — so endet keine
     Artikelseite in einer Sackgasse. */
  const alle = veroeffentlichteArtikel();
  const index = alle.findIndex((eintrag) => eintrag.slug === artikel.slug);
  const naechster = alle.length > 1 ? alle[(index + 1) % alle.length] : null;

  return (
    <ArtikelSeite
      artikel={artikel}
      autor={autor}
      cluster={cluster}
      imThema={imThema}
      naechster={naechster}
    />
  );
}
