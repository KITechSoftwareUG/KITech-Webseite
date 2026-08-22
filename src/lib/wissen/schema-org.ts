import { BASE_URL } from "@/lib/metadata";
import { company } from "@/config/company";
import type { Artikel, Autor, Cluster } from "./schema";

/**
 * JSON-LD für Artikel, Autorenseiten und Themen-Hubs.
 *
 * **Bewusst schmal gehalten.** Googles Article-Dokumentation kennt genau sieben
 * Eigenschaften, und alle stehen dort unter „Recommended" — Pflichtfelder gibt es
 * keine. `keywords`, `wordCount`, `articleSection` und `speakable` kommen in der
 * Dokumentation gar nicht vor: schema.org-gültig, aber an kein Google-Feature
 * gebunden. Sie wären Ballast, der so aussieht, als täte er etwas.
 *
 * **Kein FAQPage-Schema.** Google hat das FAQ-Rich-Result zum 07.05.2026
 * abgeschaltet und die Dokumentation im Juni 2026 entfernt; die alte Doku-URL
 * leitet auf den Changelog-Eintrag um. Das Markup erzeugt kein Suchergebnis mehr.
 * Was messbar wirkt, ist der sichtbare Frage-Antwort-Block im HTML — den rendert
 * `ArtikelSeite.tsx`. Wer hier FAQPage nachrüstet, gewinnt nichts und pflegt
 * einen zweiten Ort für dieselben Texte.
 *
 * **Warum die Autorenseite trotzdem Markup bekommt:** Google empfiehlt für
 * `author` ausdrücklich `type` plus `url` oder `sameAs` — und für interne
 * Profilseiten zusätzlich `ProfilePage`-Auszeichnung, die anders als `Article`
 * ein echtes Pflichtfeld hat (`mainEntity`). Das ist bei einem Blog dieser Größe
 * die einzige Stelle, an der strukturierte Daten noch Substanz tragen.
 *
 * **Was strukturierte Daten hier NICHT leisten:** Der Lesecache von ChatGPT
 * entfernt Scripts und damit JSON-LD, bevor das Modell die Seite sieht. Jede
 * Aussage, die zitiert werden soll, muss im sichtbaren Text stehen. Markup ist
 * Ergänzung, nie Ersatz.
 */

interface SchemaBase {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

/** Stabile Kennung des Herausgebers — ein Knoten, auf den alles zeigt. */
const HERAUSGEBER_ID = `${BASE_URL}/#organisation`;

export function autorId(slug: string): string {
  return `${BASE_URL}/autoren/${slug}#person`;
}

export function autorUrl(slug: string): string {
  return `${BASE_URL}/autoren/${slug}`;
}

export function artikelUrl(slug: string): string {
  return `${BASE_URL}/gratis-wissen/${slug}`;
}

export function clusterUrl(slug: string): string {
  return `${BASE_URL}/gratis-wissen/thema/${slug}`;
}

/**
 * Der Personen-Knoten eines Autors.
 *
 * `@id` ist keine Google-Anforderung — Google nennt als Disambiguierungs-Anker
 * `url` und `sameAs`. Die stabile Kennung steht trotzdem hier, aus einem
 * anderen Grund: Über hunderte Artikel hinweg entstünde sonst bei jedem Beitrag
 * ein leicht abweichendes Autor-Objekt, und der Graph zerfiele in Varianten
 * derselben Person.
 */
export function personSchema(autor: Autor): SchemaBase {
  const sameAs = autor.linkedinUrl ? [autor.linkedinUrl] : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": autorId(autor.slug),
    name: autor.name,
    url: autorUrl(autor.slug),
    jobTitle: autor.rolle,
    description: autor.kurzbeschreibung,
    ...(autor.bild ? { image: `${BASE_URL}${autor.bild}` } : {}),
    ...(sameAs ? { sameAs } : {}),
    knowsAbout: autor.themen,
    worksFor: {
      "@type": "Organization",
      "@id": HERAUSGEBER_ID,
      name: company.shortName,
      url: BASE_URL,
    },
  };
}

/**
 * `ProfilePage` für `/autoren/<slug>`.
 *
 * `mainEntity` ist hier tatsächlich Pflicht — anders als bei `Article`, wo es
 * keine Pflichtfelder gibt. Zweck laut Google: Seiten, auf denen Urheber
 * „first-hand perspectives" teilen, als solche kenntlich machen.
 */
export function profilePageSchema(autor: Autor, artikelAnzahl: number): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateCreated: "2026-08-19",
    mainEntity: personSchema(autor),
    ...(artikelAnzahl > 0
      ? {
          about: {
            "@type": "Thing",
            name: `${artikelAnzahl} Beiträge von ${autor.name}`,
          },
        }
      : {}),
  };
}

/**
 * `BlogPosting` für eine Artikelseite.
 *
 * Das Bild ist der einzige Punkt, an dem Google konkret wird: „multiple
 * high-resolution images (minimum of 50K pixels when multiplying width and
 * height)" in den Seitenverhältnissen 16:9, 4:3 und 1:1. Solange es kein
 * artikeleigenes Bild gibt, zeigt das Feld auf das Standard-Vorschaubild —
 * ein fehlendes `image` wäre die auffälligste Lücke im Markup.
 */
export function blogPostingSchema(artikel: Artikel, autor: Autor, bild: string): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: artikel.titel,
    description: artikel.teaser,
    image: [bild],
    datePublished: artikel.datum,
    dateModified: artikel.aktualisiert,
    inLanguage: "de-DE",
    mainEntityOfPage: { "@type": "WebPage", "@id": artikelUrl(artikel.slug) },
    author: {
      "@type": "Person",
      "@id": autorId(autor.slug),
      name: autor.name,
      url: autorUrl(autor.slug),
      ...(autor.linkedinUrl ? { sameAs: [autor.linkedinUrl] } : {}),
    },
    publisher: {
      "@type": "Organization",
      "@id": HERAUSGEBER_ID,
      name: company.shortName,
      url: BASE_URL,
    },
  };
}

/**
 * `CollectionPage` für einen Themen-Hub.
 *
 * Die enthaltenen Artikel stehen als `ItemList` darin — nicht wegen eines
 * Rich Results (es gibt keines), sondern damit ein abrufendes System die
 * Zugehörigkeit ohne Textanalyse erkennt.
 */
export function clusterSchema(cluster: Cluster, artikel: Artikel[]): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cluster.titel,
    description: cluster.teaser,
    url: clusterUrl(cluster.slug),
    inLanguage: "de-DE",
    isPartOf: {
      "@type": "WebSite",
      name: company.shortName,
      url: BASE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: artikel.length,
      itemListElement: artikel.map((eintrag, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: artikelUrl(eintrag.slug),
        name: eintrag.titel,
      })),
    },
  };
}
