import { SITE_CONTAINER } from "@/components/layout/site-container";
import { faq } from "@/data/faq";

/**
 * Die fünf häufigsten Einwände, beantwortet — unter dem Gründerwort.
 *
 * **Alles offen, kein Aufklapper.** Zwei Gründe: Fünf kurze Antworten liest man
 * schneller, als man sie anklickt, und Google verlangt für das
 * `FAQPage`-Schema, dass der ausgezeichnete Text tatsächlich auf der Seite
 * steht. Ein Radix-Accordion hängt den Inhalt im geschlossenen Zustand aus dem
 * DOM aus — genau das, was man hier nicht will, wenn die Fragen als
 * Suchergebnis erscheinen sollen.
 *
 * Frage links, Antwort rechts, dazwischen Trennlinien statt Kacheln (`divide-y`)
 * — dasselbe Muster wie die Werte auf `/haltung`.
 *
 * Das Schema selbst wird in `Home.tsx` aus derselben Datenquelle erzeugt, damit
 * Auszeichnung und sichtbarer Text nicht auseinanderlaufen können.
 */
export function FaqBlock() {
  return (
    <section className={`${SITE_CONTAINER} py-16 sm:py-20`} aria-labelledby="faq">
      <h2
        id="faq"
        className="max-w-[760px] text-balance text-h2 uppercase leading-[1.1] tracking-tight text-foreground"
      >
        Fragen, die im ersten Gespräch immer kommen
      </h2>

      <dl className="mt-10 divide-y divide-border border-y border-border">
        {faq.map((eintrag) => (
          <div
            key={eintrag.frage}
            className="grid gap-2 py-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-10"
          >
            <dt className="text-pretty text-h4 leading-snug text-foreground">{eintrag.frage}</dt>
            <dd className="text-pretty text-lead text-muted-foreground">{eintrag.antwort}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
