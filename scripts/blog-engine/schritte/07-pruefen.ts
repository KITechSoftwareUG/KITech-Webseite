/**
 * SCHRITT 07 — Das Qualitätstor.
 *
 * `lib/qualitaet.ts` misst den fertigen Artikel gegen den Hausstil und gegen die
 * GEO-Struktur. Dieser Schritt macht aus der Messung eine Entscheidung:
 *
 *   **harte Fehler**  gehen zurück an das Modell, mit der Befundliste und der
 *                     Anweisung, genau diese Stellen zu ändern und sonst nichts.
 *   **Warnungen**     werden protokolliert und blockieren nichts. Sie markieren
 *                     Korridore, und ein Text, der aus gutem Grund am Rand eines
 *                     Korridors liegt, soll nicht von der Statistik gestoppt
 *                     werden.
 *
 * **Was dieser Schritt nicht tut: werfen.** Bleiben nach den Durchgängen harte
 * Fehler stehen, kommt der Artikel trotzdem zurück — als `entwurf`, mit den
 * Befunden im Protokoll. Ein Lauf, der am letzten Schritt eine Ausnahme wirft,
 * verliert die Arbeit von neun Schritten und hinterlässt niemandem etwas zum
 * Ansehen. Ein Entwurf mit drei offenen Befunden ist für einen Menschen in zehn
 * Minuten zu retten. Die Entscheidung, ob er trotzdem online geht, gehört ihm —
 * und genau diese Trennung beschreiben Googles Bewertungsrichtlinien mit „the
 * extent to which a human being actively worked to create satisfying content“.
 */

import type { Artikel } from "../../../src/lib/wissen/schema.js";
import { artikelSchema } from "../../../src/lib/wissen/schema.js";
import type { Brief, SchreibErgebnis } from "../lib/typen.js";
import { MODELL_SCHREIBEN, frage } from "../lib/claude.js";
import { fehler, melde, warne } from "../lib/protokoll.js";
import { pruefeArtikel, type Befund } from "../lib/qualitaet.js";
import {
  ARTIKEL_SCHEMA,
  filtereQuellen,
  liesPrompt,
  pruefeAnkertexte,
  type ModellArtikel,
} from "./06-schreiben.js";

/** Wörter je Minute für die Lesezeit — derselbe Wert wie in Schritt 06. */
const WOERTER_JE_MINUTE = 200;

/**
 * Prüft den Artikel und bessert nach, solange harte Fehler übrig sind.
 *
 * ### Warum drei Durchgänge und nicht unbegrenzt
 *
 * Drei ist keine gerundete Zahl, sondern die Stelle, an der sich das Vorzeichen
 * dreht. Ein Korrekturdurchgang schickt den ganzen Artikel und den ganzen
 * Hausstil noch einmal durch das Modell — er kostet ungefähr so viel wie das
 * Schreiben selbst. Und er bringt am wenigsten dort, wo er am häufigsten
 * gebraucht wird: Die harten Regeln sind fast alle Verbote (kein „du“, kein
 * Semikolon, kein Satz über 32 Wörter), und die behebt der erste Durchgang.
 * Was ihn übersteht, sind Befunde, die eine Umformulierung des Gedankens
 * verlangen — dabei entstehen regelmäßig neue Befunde an anderer Stelle, und
 * eine unbegrenzte Schleife dreht sich zwischen zwei Fassungen, die sich
 * abwechselnd gegenseitig verletzen. Beobachtbar ist das an der Zahl der
 * Befunde: Sinkt sie zwischen zwei Durchgängen nicht, bricht dieser Schritt ab,
 * statt das dritte Mal zu bezahlen.
 *
 * Wer die Grenze anhebt, hebt die Kosten je Artikel und verschiebt eine
 * redaktionelle Entscheidung weiter in die Maschine. Beides ist eine
 * inhaltliche Entscheidung, keine technische.
 */
export async function pruefeUndBessere(
  artikel: Artikel,
  brief: Brief,
  maxDurchgaenge = 3
): Promise<SchreibErgebnis> {
  let aktuell = artikel;
  let durchgaenge = 0;
  let ergebnis = pruefeArtikel(aktuell);
  let letzteAnzahl = ergebnis.harteFehler.length;

  while (!ergebnis.bestanden && durchgaenge < maxDurchgaenge) {
    melde(
      `Durchgang ${durchgaenge + 1} von ${maxDurchgaenge}: ` +
        `${ergebnis.harteFehler.length} harte Fehler.`
    );

    const gebessert = await besserNach(aktuell, brief, ergebnis.harteFehler);
    durchgaenge++;

    if (!gebessert) {
      warne("Die Korrektur war unbrauchbar. Der vorherige Stand bleibt stehen.");
      break;
    }

    aktuell = gebessert;
    ergebnis = pruefeArtikel(aktuell);

    // Ein Durchgang, der die Zahl der Befunde nicht senkt, senkt sie auch beim
    // nächsten Mal nicht — er tauscht nur einen Fehler gegen einen anderen.
    if (!ergebnis.bestanden && ergebnis.harteFehler.length >= letzteAnzahl) {
      warne(
        `Durchgang ${durchgaenge} hat nichts gebracht ` +
          `(${letzteAnzahl} auf ${ergebnis.harteFehler.length} harte Fehler). Abbruch.`
      );
      break;
    }
    letzteAnzahl = ergebnis.harteFehler.length;
  }

  for (const warnung of ergebnis.warnungen) {
    warne(`${warnung.regel} — ${warnung.fundstelle}: ${warnung.text}`, {
      hinweis: warnung.hinweis,
    });
  }

  if (ergebnis.bestanden) {
    melde(
      `Artikel „${aktuell.slug}“ besteht die Prüfung nach ${durchgaenge} Durchgängen ` +
        `(${ergebnis.warnungen.length} Warnungen).`
    );
  } else {
    fehler(
      `Artikel „${aktuell.slug}“ hat nach ${durchgaenge} Durchgängen noch ` +
        `${ergebnis.harteFehler.length} harte Fehler. Er bleibt Entwurf und wartet ` +
        `auf einen Menschen.`
    );
    for (const befund of ergebnis.harteFehler) {
      fehler(`${befund.regel} — ${befund.fundstelle}: ${befund.text}`, {
        hinweis: befund.hinweis,
      });
    }
  }

  return {
    // Doppelt gemoppelt und trotzdem richtig: Schritt 06 setzt den Status, hier
    // steht er noch einmal. Ein Artikel, der die Prüfung nicht besteht und
    // versehentlich als veröffentlicht zurückkommt, wäre genau der Fehler, den
    // dieses ganze Tor verhindern soll.
    artikel: { ...aktuell, status: "entwurf" },
    durchgaenge,
  };
}

/* -------------------------------------------------------------------------- */
/* Ein Korrekturdurchgang                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Schickt den Artikel mit der Befundliste zurück und übernimmt das Ergebnis nur,
 * wenn es das Datenmodell hält.
 *
 * Gibt `null` zurück, wenn die Korrektur unbrauchbar war — dann bleibt der
 * vorherige Stand stehen. Eine kaputte Korrektur ist schlechter als ein Text
 * mit bekannten Befunden: Bei dem weiß man, was fehlt.
 */
async function besserNach(
  artikel: Artikel,
  brief: Brief,
  harteFehler: Befund[]
): Promise<Artikel | null> {
  let korrigiert: ModellArtikel;
  try {
    korrigiert = await frage<ModellArtikel>({
      modell: MODELL_SCHREIBEN,
      system: liesPrompt("hausstil.md"),
      nachricht: baueKorrekturauftrag(artikel, harteFehler),
      schema: ARTIKEL_SCHEMA,
      maxTokens: 16_000,
      zweck: "korrektur",
    });
  } catch (ursache: unknown) {
    const meldung = ursache instanceof Error ? ursache.message : String(ursache);
    warne(`Korrekturdurchgang fehlgeschlagen: ${meldung}`);
    return null;
  }

  const zusammengesetzt = uebernehmeUnveraenderliches(korrigiert, artikel);
  const gefiltert = pruefeAnkertexte(
    filtereQuellen(zusammengesetzt, brief),
    bekannteZiele(artikel, brief)
  );

  const geprueft = artikelSchema.safeParse(gefiltert);
  if (!geprueft.success) {
    warne(
      "Die Korrektur hält das Datenmodell nicht ein:\n" +
        geprueft.error.issues
          .map((issue) => `- ${issue.path.join(".") || "(Wurzel)"}: ${issue.message}`)
          .join("\n")
    );
    return null;
  }

  return geprueft.data;
}

/**
 * Setzt alle Felder zurück, die ein Korrekturdurchgang nicht ändern darf.
 *
 * Ein Modell, das einen ganzen Artikel neu ausgibt, ändert unterwegs Kleinigkeiten
 * mit — einen Slug, einen Autorennamen, eine Zeile in `substanz`. Beim Schreiben
 * wäre das ein Schönheitsfehler, hier ist es gefährlich: Der Slug ist die Adresse,
 * `substanz` ist die Prüfspur, und `autor` ist der Name eines Menschen, der für
 * den Text geradesteht. Nichts davon steht zur Korrektur.
 *
 * `aktualisiert` und `lesezeit` laufen dagegen mit, weil der Text sich geändert
 * hat.
 */
function uebernehmeUnveraenderliches(korrigiert: ModellArtikel, alt: Artikel): Artikel {
  const zusammen: Artikel = {
    ...korrigiert,
    slug: alt.slug,
    cluster: alt.cluster,
    autor: alt.autor,
    zielKeyword: alt.zielKeyword,
    sekundaerKeywords: alt.sekundaerKeywords,
    substanz: alt.substanz,
    datum: alt.datum,
    aktualisiert: new Date().toISOString().slice(0, 10),
    status: "entwurf",
    lesezeit: alt.lesezeit,
    erzeugt: alt.erzeugt,
  };

  zusammen.lesezeit = Math.min(
    25,
    Math.max(3, Math.ceil(zaehleWoerter(zusammen) / WOERTER_JE_MINUTE))
  );
  return zusammen;
}

/**
 * Die Pfade, auf die der korrigierte Artikel zeigen darf.
 *
 * Schritt 07 kennt den Artikelbestand nicht — er bekommt nur den einen Artikel.
 * Erlaubt ist deshalb, was schon drinsteht (Schritt 06 hat es geprüft) plus die
 * Ziele aus dem Briefing. Ein Korrekturdurchgang darf Links behalten und
 * umformulieren, aber keine neuen Adressen erfinden.
 */
function bekannteZiele(artikel: Artikel, brief: Brief): Set<string> {
  const ziele = new Set<string>();
  for (const link of artikel.interneLinks ?? []) ziele.add(link.ziel);
  for (const eintrag of brief.verlinkungsziele) ziele.add(eintrag.ziel);
  return ziele;
}

function baueKorrekturauftrag(artikel: Artikel, harteFehler: Befund[]): string {
  const befunde = harteFehler
    .map(
      (befund, index) =>
        `${index + 1}. Regel \`${befund.regel}\` in ${befund.fundstelle}\n` +
        `   Stelle: ${befund.text}\n` +
        `   Warum: ${befund.hinweis}`
    )
    .join("\n");

  return [
    "# Korrekturauftrag",
    "",
    "Der folgende Artikel ist fertig geschrieben. Die Qualitätsprüfung hat die",
    "Stellen darunter beanstandet. Gib den vollständigen Artikel noch einmal aus",
    "und behebe **genau diese Stellen**.",
    "",
    "Ändere sonst nichts: keine anderen Formulierungen, keine neue Gliederung,",
    "keine zusätzlichen Abschnitte, keine neuen Quellen, keine neuen Linkziele.",
    "Jede Änderung, die nicht auf einen Befund unten zurückgeht, ist ein Fehler —",
    "der Text ist redaktionell bereits abgenommen, beanstandet sind nur die",
    "genannten Stellen.",
    "",
    "Wenn ein Befund sich nur durch Umformulieren des Gedankens beheben lässt,",
    "formulier den betroffenen Satz neu und lass die Nachbarsätze stehen.",
    "",
    "## Beanstandete Stellen",
    "",
    befunde,
    "",
    "## Der Artikel",
    "",
    "```json",
    JSON.stringify(artikelOhneVerwaltung(artikel), null, 2),
    "```",
  ].join("\n");
}

/**
 * Zeigt dem Modell nur, was es ändern darf.
 *
 * `substanz`, `status`, `datum` und die Herkunftsangaben stehen fest und werden
 * nach dem Durchgang ohnehin überschrieben. Sie mitzuschicken wäre eine
 * Einladung, an ihnen zu drehen — und würde bei jedem Durchgang Token kosten,
 * die nichts bewirken.
 */
function artikelOhneVerwaltung(artikel: Artikel): Partial<Artikel> {
  const { substanz, status, freigabe, erzeugt, datum, aktualisiert, lesezeit, ...rest } =
    artikel;
  return rest;
}

/** Zählt die Wörter im sichtbaren Fließtext. Gleiche Rechnung wie in Schritt 06. */
function zaehleWoerter(artikel: Artikel): number {
  const teile: string[] = [artikel.intro ?? "", artikel.fazit ?? ""];
  for (const abschnitt of artikel.abschnitte ?? []) {
    teile.push(abschnitt.heading, ...(abschnitt.paragraphs ?? []), ...(abschnitt.bullets ?? []));
    for (const unter of abschnitt.unterabschnitte ?? []) {
      teile.push(unter.heading, ...(unter.paragraphs ?? []));
    }
  }
  for (const eintrag of artikel.faq ?? []) teile.push(eintrag.frage, eintrag.antwort);
  return teile
    .join(" ")
    .split(/\s+/)
    .filter((wort) => wort.length > 0).length;
}
