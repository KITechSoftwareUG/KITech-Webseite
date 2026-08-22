import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import type { InternerLink } from "./schema";

/**
 * Setzt die internen Links eines Artikels an genau die Stellen im Fließtext, an
 * denen ihr Ankertext steht.
 *
 * WARUM NICHT ALS MARKUP IM TEXT: Die Artikel liegen als JSON, und ihre Absätze
 * sind reiner Text. Links als HTML hineinzuschreiben hieße, in jeder Datei
 * Markup zu speichern, das niemand prüft — und die Pipeline müsste beim
 * Schreiben gültiges HTML erzeugen statt Sätze. Stattdessen steht der Link als
 * eigenes Feld daneben (`ziel`, `ankertext`, `abschnitt`), und diese Funktion
 * bringt beides zusammen. Das Schema kann die Links dadurch zählen und prüfen;
 * ein `<a href>` mitten in einem JSON-String könnte es nicht.
 *
 * WARUM DIE LINKS ÜBERHAUPT ZÄHLEN: Die einzige belastbare öffentliche
 * Datengrundlage zu interner Verlinkung ist die Auswertung von 23 Millionen
 * internen Links über 1.800 Websites durch Zyppy. Zwei Befunde daraus stehen
 * hinter dem Aufbau hier — beide sind Korrelationen, was die Autoren selbst
 * betonen:
 *
 *   1. Seiten mit 40–44 eingehenden internen Links bekamen im Schnitt viermal so
 *      viele Suchklicks wie Seiten mit 0–4. Ab etwa 45 bis 50 dreht sich der
 *      Zusammenhang um.
 *   2. Der stärkste gemessene Zusammenhang war nicht die *Zahl* der Links,
 *      sondern die **Vielfalt der Ankertexte**, die auf dieselbe Seite zeigen.
 *      Ein Navigationslink auf jeder Seite trägt nur einen einzigen Ankertext —
 *      und zählt deshalb wie ein einziger redaktioneller Link.
 *
 * Deshalb variiert die Pipeline die Ankertexte pro Artikel, statt überall
 * dieselbe Formulierung zu setzen.
 *
 * Jeder Ankertext wird höchstens **einmal** verlinkt, bei der ersten Fundstelle.
 * Zwei Links auf dieselbe Seite im selben Absatz sehen nach Optimierung aus und
 * bringen nichts.
 */

/** Sonderzeichen für den Einsatz in einem regulären Ausdruck entschärfen. */
function maskiere(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Zerlegt einen Absatz in Text und Links.
 *
 * `bereitsGesetzt` wird über alle Absätze eines Abschnitts hinweg geführt: Steht
 * ein Ankertext in zwei Absätzen, wird nur der erste zum Link.
 */
export function verlinkeAbsatz(
  text: string,
  links: InternerLink[],
  bereitsGesetzt: Set<string>
): ReactNode {
  const offen = links.filter((link) => !bereitsGesetzt.has(link.ziel + link.ankertext));
  if (offen.length === 0) return text;

  /* Längste Ankertexte zuerst prüfen — sonst frisst ein kurzer Anker
     ("KI-Check") den Anfang eines längeren ("KI-Check vereinbaren"). */
  const sortiert = [...offen].sort((a, b) => b.ankertext.length - a.ankertext.length);

  for (const link of sortiert) {
    const muster = new RegExp(maskiere(link.ankertext));
    const treffer = muster.exec(text);
    if (!treffer) continue;

    bereitsGesetzt.add(link.ziel + link.ankertext);

    const davor = text.slice(0, treffer.index);
    const danach = text.slice(treffer.index + link.ankertext.length);

    return (
      <>
        {davor ? verlinkeAbsatz(davor, links, bereitsGesetzt) : null}
        <Link
          href={link.ziel}
          className="font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
        >
          {link.ankertext}
        </Link>
        {danach ? verlinkeAbsatz(danach, links, bereitsGesetzt) : null}
      </>
    );
  }

  return text;
}

/**
 * Alle Absätze eines Abschnitts verlinken.
 *
 * Gibt fertige `<p>`-Elemente zurück. Der Aufrufer muss den Zustand
 * (`bereitsGesetzt`) über den ganzen Artikel führen, sonst taucht derselbe Link
 * in jedem Abschnitt erneut auf.
 */
export function AbsaetzeMitLinks({
  absaetze,
  links,
  bereitsGesetzt,
  className,
}: {
  absaetze: string[];
  links: InternerLink[];
  bereitsGesetzt: Set<string>;
  className?: string;
}) {
  return (
    <>
      {absaetze.map((absatz, index) => (
        <p key={index} className={className}>
          {verlinkeAbsatz(absatz, links, bereitsGesetzt)}
        </p>
      ))}
    </>
  );
}

export { Fragment };
