import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata, kuerze, TITEL_MAX } from "@/lib/metadata";
import { alleCluster, artikelImCluster, clusterNachSlug } from "@/lib/wissen/laden";
import ThemaSeite from "@/views/wissen/ThemaSeite";

interface ThemaPageProps {
  params: Promise<{ cluster: string }>;
}

export const dynamicParams = false;

/**
 * Nur Themen mit mindestens einem Artikel bekommen eine Seite.
 *
 * Ein Hub ohne Beiträge ist eine Seite, die ein Thema ankündigt und nichts dazu
 * hat — für einen Besucher eine Sackgasse, für die Suche eine dünne Seite. Sie
 * entsteht automatisch, sobald der erste Artikel dazu erscheint.
 */
export function generateStaticParams() {
  return alleCluster()
    .filter((eintrag) => artikelImCluster(eintrag.slug).length > 0)
    .map((eintrag) => ({ cluster: eintrag.slug }));
}

export async function generateMetadata({ params }: ThemaPageProps): Promise<Metadata> {
  const { cluster: slug } = await params;
  const cluster = clusterNachSlug(slug);

  if (!cluster) {
    return buildMetadata({
      title: "Thema nicht gefunden – KITech Software",
      description: "Dieses Thema gibt es nicht (mehr).",
      path: `/gratis-wissen/thema/${slug}`,
      noindex: true,
    });
  }

  /*
   * Zwei Zusätze hinter dem Thementitel ergaben bis zu 82 Zeichen — der längste
   * Titel der Website. Einer reicht.
   *
   * Und auch der eine nur, wenn er passt: „KI-Betrieb: Cloud, eigene Hardware,
   * Souveränität" misst allein 47 Zeichen, mit Zusatz 63 — über TITEL_MAX. Der
   * Zusatz ist der verzichtbare Teil, nicht das Thema. Dieselbe Entscheidung wie
   * am 20.08.2026 beim Firmennamen: Was abgeschnitten würde, steht besser gar
   * nicht erst da.
   */
  const zusatz = " – Gratis-Wissen";
  const titel =
    cluster.titel.length + zusatz.length <= TITEL_MAX ? `${cluster.titel}${zusatz}` : cluster.titel;

  return buildMetadata({
    title: titel,
    description: kuerze(cluster.teaser),
    path: `/gratis-wissen/thema/${cluster.slug}`,
  });
}

export default async function Page({ params }: ThemaPageProps) {
  const { cluster: slug } = await params;
  const cluster = clusterNachSlug(slug);

  if (!cluster) {
    notFound();
  }

  const artikel = artikelImCluster(cluster.slug);

  if (artikel.length === 0) {
    notFound();
  }

  const andereThemen = alleCluster().filter(
    (eintrag) => eintrag.slug !== cluster.slug && artikelImCluster(eintrag.slug).length > 0
  );

  return <ThemaSeite cluster={cluster} artikel={artikel} andereThemen={andereThemen} />;
}
