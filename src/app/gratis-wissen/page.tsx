import { buildMetadata } from "@/lib/metadata";
import { alleCluster, artikelImCluster, veroeffentlichteArtikel } from "@/lib/wissen/laden";
import UebersichtSeite from "@/views/wissen/UebersichtSeite";

export const metadata = {
  ...buildMetadata({
    /* Titel und Beschreibung am 20.08.2026 auf den Korridor gebracht: 70 bzw.
       192 Zeichen waren beide über der Kürzungsgrenze. Der Zusatz
       „– KITech Software" kostet 18 Zeichen und trägt auf einer Hub-Seite
       nichts bei, deshalb steht er hier nicht mehr. */
    title: "Gratis-Wissen: KI im Mittelstand – Artikel und Ratgeber",
    description:
      "Artikel zu KI, Automatisierung und Software im Mittelstand: was sich rechnet, was schiefgeht, was es kostet. Kostenlos, ohne Anmeldung.",
    path: "/gratis-wissen",
  }),
  /* Der Feed wird hier als Alternative ausgezeichnet, damit Feed-Reader und
     Automatisierungen ihn finden, ohne die Adresse zu kennen. Erzeugt
     `<link rel="alternate" type="application/rss+xml">` im Kopf. */
  alternates: {
    canonical: "https://kitech-software.de/gratis-wissen",
    types: {
      "application/rss+xml": "https://kitech-software.de/gratis-wissen/rss.xml",
    },
  },
};

export default function Page() {
  const artikel = veroeffentlichteArtikel();

  const anzahlProCluster: Record<string, number> = {};
  for (const eintrag of artikel) {
    anzahlProCluster[eintrag.cluster] = (anzahlProCluster[eintrag.cluster] ?? 0) + 1;
  }

  /* Ein Thema ohne Artikel ist eine leere Seite — es taucht erst auf, wenn der
     erste Beitrag dazu steht. Damit wächst die Übersicht mit dem Bestand, statt
     zwölf Versprechen anzuzeigen, hinter denen nichts liegt. */
  const cluster = alleCluster().filter(
    (eintrag) => eintrag.indexierbar && artikelImCluster(eintrag.slug).length > 0
  );

  return (
    <UebersichtSeite
      cluster={cluster}
      neueste={artikel.slice(0, 24)}
      anzahlProCluster={anzahlProCluster}
      gesamt={artikel.length}
    />
  );
}
