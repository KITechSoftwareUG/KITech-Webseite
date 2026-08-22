import { BASE_URL } from "@/lib/metadata";
import { company } from "@/config/company";
import { autorNachSlug, veroeffentlichteArtikel } from "@/lib/wissen/laden";

/**
 * RSS-2.0-Feed unter `/gratis-wissen/rss.xml`.
 *
 * **Der Hauptgrund ist nicht die Suche, sondern die eigene Automatisierung.**
 * Dieses Projekt betreibt n8n bereits als eigenen Dienst. Ein Feed ist die
 * billigste stabile Schnittstelle, um einen neuen Artikel automatisch nach
 * LinkedIn, in einen Newsletter oder ins CRM zu schieben — ohne dass die Website
 * dafür einen weiteren Webhook kennen muss. Wer den Kanal wechselt, fasst die
 * Website nie wieder an.
 *
 * **Der zweite Grund ist ein Nebeneffekt:** Google nimmt RSS 2.0 und Atom 1.0 als
 * Sitemap-Format an. Der Feed lässt sich in der Search Console zusätzlich zur
 * XML-Sitemap einreichen und dort getrennt auswerten — mit der dokumentierten
 * Einschränkung, dass er „only provides information on recent URLs" und deshalb
 * die Sitemap ergänzt statt sie zu ersetzen.
 *
 * Was er **nicht** ist: ein Rankingfaktor. Dafür gibt es keinen Beleg, und die
 * Reichweite klassischer Feed-Leser ist für einen deutschen B2B-Blog klein.
 */

/** Zeichen, die in XML nicht roh stehen dürfen. */
function xml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const WOCHENTAGE = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONATE = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * `2026-08-19` → `Wed, 19 Aug 2026 08:00:00 +0000`.
 *
 * RSS verlangt das Format aus RFC 822. Die Uhrzeit ist fest auf 08:00 UTC
 * gesetzt, weil das Artikeldatum keine trägt — ein erfundener Zeitstempel wäre
 * kein besserer, und ein wechselnder würde bei jedem Abruf einen geänderten Feed
 * vortäuschen.
 */
function rfc822(iso: string): string {
  const [jahr, monat, tag] = iso.split("-").map(Number);
  const datum = new Date(Date.UTC(jahr, monat - 1, tag, 8));
  const wochentag = WOCHENTAGE[datum.getUTCDay()];
  const tagZweistellig = String(tag).padStart(2, "0");
  return `${wochentag}, ${tagZweistellig} ${MONATE[monat - 1]} ${jahr} 08:00:00 +0000`;
}

export function GET(): Response {
  /* Die letzten dreißig genügen. Ein Feed ist ein Frischekanal, kein Archiv —
     dafür gibt es die Sitemap. */
  const artikel = veroeffentlichteArtikel().slice(0, 30);

  const eintraege = artikel
    .map((eintrag) => {
      const autor = autorNachSlug(eintrag.autor);
      const url = `${BASE_URL}/gratis-wissen/${eintrag.slug}`;

      return `    <item>
      <title>${xml(eintrag.titel)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(eintrag.datum)}</pubDate>
      <description>${xml(eintrag.teaser)}</description>
      <category>${xml(eintrag.kategorie)}</category>${
        autor ? `\n      <dc:creator>${xml(autor.name)}</dc:creator>` : ""
      }
    </item>`;
    })
    .join("\n");

  const neuestes = artikel[0]?.datum;

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Gratis-Wissen — ${xml(company.shortName)}</title>
    <link>${BASE_URL}/gratis-wissen</link>
    <description>Artikel, Tipps und Ratgeber zu KI, Automatisierung und Software im Mittelstand. Ohne Anmeldung, ohne Gegenleistung.</description>
    <language>de-DE</language>
    <atom:link href="${BASE_URL}/gratis-wissen/rss.xml" rel="self" type="application/rss+xml" />${
      neuestes ? `\n    <lastBuildDate>${rfc822(neuestes)}</lastBuildDate>` : ""
    }
${eintraege}
  </channel>
</rss>
`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      /* Eine Stunde zwischenspeichern, danach im Hintergrund erneuern. Bei
         wenigen Artikeln am Tag reicht das; ein Feed, der bei jedem Abruf neu
         erzeugt wird, kostet ohne Gegenwert Rechenzeit. */
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
