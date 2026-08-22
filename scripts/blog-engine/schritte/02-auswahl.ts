import type { Artikel } from "@/lib/wissen/schema";
import { melde, warne } from "../lib/protokoll.js";
import type { AuswahlErgebnis, KeywordDaten, ThemaImVorrat, ThemenfindungErgebnis } from "../lib/typen.js";

/**
 * Schritt 02 — Auswahl: *Was schreibt man heute?*
 *
 * Reine Regeln, kein Modell. Das ist Absicht: Die Entscheidung, ob ein Thema
 * produziert wird, muss nachvollziehbar und wiederholbar sein. Ein Modell, das
 * heute anders entscheidet als gestern, macht aus jedem Verwurf eine Meinung —
 * und aus dem Substanz-Tor unten eine Empfehlung.
 *
 * Jeder Verwurf trägt seine Begründung, und die landet im Laufprotokoll. Wer
 * morgens sieht, dass nichts geschrieben wurde, soll in einer Zeile lesen
 * können, warum.
 */

/**
 * Ab welcher Wortüberschneidung zwei Keywords als dasselbe Thema gelten.
 *
 * 0,7 heißt: von zehn Wörtern sind sieben dieselben. „ki dsgvo konform
 * einsetzen" und „ki dsgvo konform nutzen" liegen bei 0,6 und dürfen beide
 * existieren; „prozesse automatisieren unternehmen" gegen „prozesse im
 * unternehmen automatisieren" liegt bei 1,0 und darf es nicht.
 *
 * **Warum überhaupt:** Zwei Artikel auf dasselbe Ziel konkurrieren gegeneinander
 * statt gegen den Wettbewerb, und ChatGPT dedupliziert Ergebnisse zusätzlich pro
 * Domain — dort verdrängt die schwächere Seite dann die stärkere.
 */
const KANNIBALISIERUNG_GRENZE = 0.7;

/**
 * Untergrenze für ein Thema, das sich lohnen soll — **nur zusammen mit** der
 * Schwierigkeit unten.
 *
 * Ein Nischenkeyword mit zehn Suchanfragen im Monat ist kein Ausschlussgrund:
 * Wenn es leicht zu holen ist, kostet der Platz fast nichts und bringt genau
 * die zehn Leute, die das Problem haben. Erst die Kombination aus wenig Ertrag
 * und viel Aufwand ist ein schlechtes Geschäft.
 */
const MINDEST_VOLUMEN = 20;

/** Ab hier gilt ein Keyword als schwer erkämpft (DataForSEO-Skala 0–100). */
const MAX_SCHWIERIGKEIT = 60;

/**
 * Höchstzahl Sekundärkeywords je Artikel.
 *
 * Das Schema erlaubt zwölf. Acht ist die Grenze, ab der ein Text anfängt,
 * Begriffe unterzubringen statt Sätze zu schreiben — und genau das erkennt
 * jeder Leser sofort.
 */
const SEKUNDAER_MAX = 8;

/* -------------------------------------------------------------------------- */
/* Werkzeug                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Zerlegt ein Keyword in seine Wörter.
 *
 * `\p{L}` statt `\w`, weil `\w` weder Umlaute noch ß kennt — „größe" zerfiele
 * sonst in „gr" und „e" und wäre zu jedem anderen Keyword unähnlich.
 */
function wortmenge(keyword: string): Set<string> {
  return new Set(
    keyword
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean),
  );
}

/** Schnittmenge durch Vereinigungsmenge — 0 bedeutet nichts gemeinsam, 1 identisch. */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let schnitt = 0;
  for (const wort of a) if (b.has(wort)) schnitt += 1;
  return schnitt / (a.size + b.size - schnitt);
}

function schluessel(keyword: string): string {
  return keyword.trim().toLowerCase();
}

/* -------------------------------------------------------------------------- */
/* Die Tore                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * DAS SUBSTANZ-TOR. Es darf nie weich werden.
 *
 * `substanz === null` heißt: Für dieses Thema hat kein Mensch etwas
 * beigesteuert, das eine Recherche nicht auch hätte — keine gemessene Zahl,
 * keine Konfiguration aus einem laufenden System, keine Entscheidung mit
 * Begründung, keinen Fehler mit Kosten. Was dann entstünde, wäre eine
 * Zusammenfassung der ersten zehn Suchergebnisse.
 *
 * **Warum das die wichtigste Zeile dieser Datei ist:** Google beschreibt in der
 * eigenen Anleitung zu generativen Suchfunktionen die Messlatte wörtlich als
 * „Don't just recycle what others on the internet have already said, or could
 * easily be produced by a generative AI model", und die Bewertungsanleitung für
 * die eigenen Prüfer definiert Qualität über „the extent to which a human being
 * actively worked to create satisfying content". Bei drei Artikeln im Jahr fällt
 * ein substanzloser Text nicht auf. Bei täglicher Veröffentlichung ist er das
 * Muster, nach dem die ganze Domain bewertet wird — und dann trägt auch der
 * gute Artikel von vorgestern die Abwertung mit.
 *
 * **Deshalb ist dieses Tor kein Filter, sondern die Existenzbedingung der
 * Automatik.** Es zu lockern („nur diesmal, der Vorrat ist leer") tauscht das
 * Risiko der ganzen Domain gegen einen einzelnen Artikel. Wenn der Vorrat leer
 * ist, ist die richtige Antwort: heute nichts veröffentlichen und den Vorrat
 * füllen. Ein Lauf ohne Ergebnis ist kein Fehler dieser Automatik, sondern ihre
 * Funktionsweise.
 *
 * Wer hier ändern will, ändert eine inhaltliche Entscheidung, keine technische.
 */
function hatEigenanteil(thema: ThemaImVorrat): boolean {
  return thema.substanz !== null && thema.substanz !== undefined;
}

/**
 * Das zweite Schloss am selben Tor: Ist der Eigenanteil auch ausgefüllt?
 *
 * Ein `substanz`-Objekt mit leerer Beschreibung ist ein Haken, den jemand
 * gesetzt hat, um an der Prüfung vorbeizukommen. Die Maße sind bewusst dieselben
 * wie im Artikelschema (`beschreibung` mindestens 40 Zeichen, `herkunft`
 * mindestens 5) — sonst käme ein Thema hier durch und scheiterte erst beim
 * Schreiben, nach allen bezahlten Schritten dazwischen.
 */
function eigenanteilVollstaendig(thema: ThemaImVorrat): boolean {
  const substanz = thema.substanz;
  if (!substanz) return false;
  return (
    Boolean(substanz.art) &&
    (substanz.beschreibung ?? "").trim().length >= 40 &&
    (substanz.herkunft ?? "").trim().length >= 5
  );
}

/**
 * Welche Keywords bereits einem Artikel gehören.
 *
 * Zurückgezogene Artikel geben ihr Keyword frei — sie stehen nicht mehr auf der
 * Website und können nicht mehr konkurrieren. **Entwürfe geben es nicht frei:**
 * Sie liegen als Datei unter `content/wissen/` und der Loader bricht bei
 * doppeltem `zielKeyword` den Build ab. Ein zweiter Artikel auf dasselbe Ziel
 * würde die Website also nicht nur schwächen, sondern gar nicht erst bauen.
 */
function belegteZielKeywords(artikel: Artikel[]): Set<string> {
  const belegt = new Set<string>();
  for (const eintrag of artikel) {
    if (eintrag.status === "zurueckgezogen") continue;
    belegt.add(schluessel(eintrag.zielKeyword));
  }
  return belegt;
}

/** Alle Begriffe, die schon irgendwo als Ziel oder Nebenziel geführt werden. */
function belegteBegriffe(artikel: Artikel[]): Set<string> {
  const belegt = new Set<string>();
  for (const eintrag of artikel) {
    if (eintrag.status === "zurueckgezogen") continue;
    belegt.add(schluessel(eintrag.zielKeyword));
    for (const nebenziel of eintrag.sekundaerKeywords ?? []) belegt.add(schluessel(nebenziel));
  }
  return belegt;
}

/**
 * Baut die Sekundärkeywords aus den verwandten Suchbegriffen.
 *
 * Sortiert nach Suchvolumen, weil ein Nebenziel ohne Nachfrage nur ein Wort im
 * Text ist. Begriffe ohne Volumenangabe landen hinten statt zu verschwinden:
 * Ohne DataForSEO-Zugang hat kein einziger eine Zahl, und dann wäre die Liste
 * sonst immer leer.
 */
function baueSekundaer(
  zielKeyword: string,
  verwandte: KeywordDaten[],
  verboten: Set<string>,
): string[] {
  const ziel = schluessel(zielKeyword);
  const gesehen = new Set<string>([ziel]);
  const auswahl: string[] = [];

  const sortiert = [...verwandte].sort((a, b) => (b.suchvolumen ?? -1) - (a.suchvolumen ?? -1));

  for (const eintrag of sortiert) {
    const wert = schluessel(eintrag.keyword);
    if (!wert || gesehen.has(wert)) continue;
    // Ein Begriff, der einem anderen Artikel gehört, ist dort das Versprechen
    // und hier nur ein Anlass, sich selbst Konkurrenz zu machen.
    if (verboten.has(wert)) continue;
    gesehen.add(wert);
    auswahl.push(eintrag.keyword.trim());
    if (auswahl.length >= SEKUNDAER_MAX) break;
  }

  return auswahl;
}

/* -------------------------------------------------------------------------- */
/* Auswahl                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Wählt aus den Kandidaten die Themen, die heute geschrieben werden.
 *
 * Die Reihenfolge der Prüfungen ist bedeutsam: Der erste zutreffende Grund wird
 * protokolliert. Substanz steht vorn, weil sie die einzige Prüfung ist, deren
 * Ergebnis niemand durch bessere Zahlen umdrehen kann.
 *
 * @param gefunden Ergebnis aus Schritt 01, bereits nach Priorität sortiert.
 * @param anzahl Wie viele Themen heute produziert werden sollen.
 * @param vorhandeneArtikel Alle Artikel unter `content/wissen/`, auch Entwürfe.
 */
export function waehleThemen(
  gefunden: ThemenfindungErgebnis,
  anzahl: number,
  vorhandeneArtikel: Artikel[],
): AuswahlErgebnis {
  const bestand = vorhandeneArtikel ?? [];
  const belegt = belegteZielKeywords(bestand);
  const bestandsMengen = bestand
    .filter((eintrag) => eintrag.status !== "zurueckgezogen")
    .map((eintrag) => ({ keyword: eintrag.zielKeyword, worte: wortmenge(eintrag.zielKeyword) }));

  const gewaehlt: AuswahlErgebnis["gewaehlt"] = [];
  const verworfen: AuswahlErgebnis["verworfen"] = [];
  const gewaehlteMengen: Array<{ keyword: string; worte: Set<string> }> = [];

  // Defensiv erneut sortiert: `waehleThemen` ist ohne Netz aufrufbar und wird
  // damit auch aus Tests und von Hand gefüttert — dann steht die Reihenfolge
  // aus Schritt 01 nicht zwingend.
  const kandidaten = [...gefunden.kandidaten].sort(
    (a, b) => a.prioritaet - b.prioritaet || a.id.localeCompare(b.id, "de"),
  );

  for (const kandidat of kandidaten) {
    if (!hatEigenanteil(kandidat)) {
      verworfen.push({ id: kandidat.id, grund: "kein belegter Eigenanteil" });
      continue;
    }

    if (!eigenanteilVollstaendig(kandidat)) {
      verworfen.push({
        id: kandidat.id,
        grund: "Eigenanteil eingetragen, aber nicht ausgefüllt (Beschreibung oder Herkunft fehlt)",
      });
      continue;
    }

    if (belegt.has(schluessel(kandidat.zielKeyword))) {
      verworfen.push({ id: kandidat.id, grund: "Keyword bereits besetzt" });
      continue;
    }

    const eigeneWorte = wortmenge(kandidat.zielKeyword);
    const nachbar = bestandsMengen.find(
      (vorhanden) => jaccard(eigeneWorte, vorhanden.worte) > KANNIBALISIERUNG_GRENZE,
    );
    if (nachbar) {
      verworfen.push({
        id: kandidat.id,
        grund: `Kannibalisierungsgefahr — zu nah an „${nachbar.keyword}"`,
      });
      continue;
    }

    const volumen = kandidat.daten?.suchvolumen ?? null;
    const schwierigkeit = kandidat.daten?.schwierigkeit ?? null;
    // Nur verwerfen, wenn **beide** Zahlen vorliegen. Fehlende Daten sind kein
    // Befund: Ohne DataForSEO-Zugang wäre sonst jedes Thema ein schlechtes
    // Geschäft, und die Automatik stünde still, obwohl nur eine API fehlt.
    if (
      volumen !== null &&
      schwierigkeit !== null &&
      volumen < MINDEST_VOLUMEN &&
      schwierigkeit > MAX_SCHWIERIGKEIT
    ) {
      verworfen.push({
        id: kandidat.id,
        grund: `Aufwand steht nicht zum Ertrag — ${volumen} Suchanfragen bei Schwierigkeit ${schwierigkeit}`,
      });
      continue;
    }

    if (gewaehlt.length >= Math.max(0, anzahl)) {
      // Kein Mangel des Themas, sondern das Tagespensum. Es bleibt im Vorrat
      // und steht morgen wieder oben.
      verworfen.push({ id: kandidat.id, grund: "Tagespensum erreicht — bleibt im Vorrat" });
      continue;
    }

    // Zum Schluss gegen das, was in diesem Lauf schon gewählt wurde. Zwei
    // benachbarte Themen aus demselben Cluster am selben Tag wären genau die
    // Kannibalisierung, die oben gegen den Bestand verhindert wird — nur
    // entstünde sie hier neu.
    const zwilling = gewaehlteMengen.find(
      (vorhanden) => jaccard(eigeneWorte, vorhanden.worte) > KANNIBALISIERUNG_GRENZE,
    );
    if (zwilling) {
      verworfen.push({
        id: kandidat.id,
        grund: `Kannibalisierungsgefahr — zu nah an „${zwilling.keyword}" aus diesem Lauf`,
      });
      continue;
    }

    gewaehlt.push({ ...kandidat, sekundaer: [] });
    gewaehlteMengen.push({ keyword: kandidat.zielKeyword, worte: eigeneWorte });
  }

  // Sekundärkeywords erst jetzt: Die Sperrliste muss auch die Zielkeywords der
  // anderen heute gewählten Themen enthalten, und die stehen erst nach dem
  // Durchlauf fest.
  const gesperrt = belegteBegriffe(bestand);
  for (const eintrag of gewaehlt) gesperrt.add(schluessel(eintrag.zielKeyword));

  for (const eintrag of gewaehlt) {
    eintrag.sekundaer = baueSekundaer(
      eintrag.zielKeyword,
      gefunden.verwandte[eintrag.id] ?? [],
      gesperrt,
    );
    // Was einmal vergeben ist, taucht beim nächsten Artikel nicht wieder auf.
    for (const nebenziel of eintrag.sekundaer) gesperrt.add(schluessel(nebenziel));
  }

  melde(
    `Auswahl: ${gewaehlt.length} von ${kandidaten.length} Themen gewählt, ` +
      `${verworfen.length} zurückgestellt.`,
  );
  for (const eintrag of verworfen) melde(`  ↳ ${eintrag.id}: ${eintrag.grund}`);

  if (gewaehlt.length === 0 && kandidaten.length > 0) {
    warne(
      "Auswahl: kein Thema hat die Prüfung bestanden. Häufigster Grund ist ein fehlender " +
        "Eigenanteil im Vorrat — das ist keine Störung, sondern das Substanz-Tor.",
    );
  }

  return { gewaehlt, verworfen };
}
