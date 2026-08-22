import { execFileSync } from "node:child_process";
import type { Artikel } from "../../../src/lib/wissen/schema.js";
import { schreibeArtikel, artikelPfad } from "../lib/artikel-io.js";
import { melde, warne, fehler } from "../lib/protokoll.js";

/**
 * Schritt 09 — die fertigen Entwürfe ablegen und den Bestand gegenprüfen.
 *
 * ⚠️ **Dieser Schritt veröffentlicht nichts.** Er schreibt Artikel mit
 * `status: "entwurf"`, lässt Tests und Build darüberlaufen und meldet, was
 * entstanden ist. Committen, freigeben und ausliefern sind getrennte,
 * menschliche Handlungen — `freigeben.ts` und der normale Deploy-Weg des Repos.
 *
 * **Warum das so gebaut ist und nicht als durchgehende Automatik:**
 *
 * 1. **Das Repo deployt bewusst nicht automatisch.** In `CLAUDE.md` steht:
 *    „Deploys laufen manuell über die Coolify-API nach explizitem Go durch den
 *    Auftraggeber — nicht automatisch nach jedem Push." Eine Automatik, die
 *    diese Regel für ihre eigenen Artikel aufhebt, hebt sie für alles auf: Im
 *    selben Deploy geht jede andere Änderung mit live, die gerade in `main`
 *    liegt.
 *
 * 2. **Die Freigabe ist der Unterschied zwischen erlaubt und Spam.** Googles
 *    Bewertungsanleitung definiert „Effort" als „the extent to which a human
 *    being actively worked to create satisfying content" und nennt als
 *    Gegenbeispiel ausdrücklich die massenhafte Erzeugung „without any
 *    oversight, manual curation etc.". Der Freigabeschritt IST diese Aufsicht.
 *    Fällt er weg, fällt das Argument weg, mit dem sich tägliche Artikel
 *    verteidigen lassen — und zwar genau dann, wenn es gebraucht wird.
 *
 * 3. **Ein Fehler wirkt sonst auf der ganzen Domain.** Die Bewertung findet auf
 *    Website-Ebene statt („after looking at several pages on the website"). Ein
 *    schlechter Artikel, der ohne Blick eines Menschen live geht, zieht
 *    `/leistungen`, `/referenzen` und die Suche nach dem Firmennamen mit.
 *
 * Wer das ändern will, ändert es bewusst und schreibt hier auf, warum. Es ist
 * eine Entscheidung über das Risiko der ganzen Domain, keine über Bequemlichkeit.
 */

export interface AblageErgebnis {
  /** Pfade der geschriebenen Entwürfe. */
  pfade: string[];
  /** Lief `npm test` durch? */
  testsGruen: boolean;
  /** Lief `npm run build` durch? */
  buildGruen: boolean;
  /** Ausgabe der fehlgeschlagenen Prüfung, gekürzt. */
  pruefausgabe: string | null;
}

/**
 * Führt ein npm-Skript aus und gibt zurück, ob es durchlief.
 *
 * `execFileSync` mit Argumentliste statt einer Kommandozeile: So gibt es keine
 * Shell, die irgendetwas interpretieren könnte. Die Eingaben stammen hier zwar
 * nicht von außen, aber ein Kindprozess mit Shell ist eine Gewohnheit, die man
 * sich an der falschen Stelle abgewöhnt.
 */
function fuehreAus(skript: string): { erfolg: boolean; ausgabe: string } {
  try {
    const ausgabe = execFileSync("npm", ["run", skript, "--silent"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 10 * 60 * 1000,
    });
    return { erfolg: true, ausgabe };
  } catch (ausnahme) {
    const fehlertext =
      ausnahme && typeof ausnahme === "object" && "stdout" in ausnahme
        ? String((ausnahme as { stdout?: unknown; stderr?: unknown }).stdout ?? "") +
          String((ausnahme as { stderr?: unknown }).stderr ?? "")
        : ausnahme instanceof Error
          ? ausnahme.message
          : String(ausnahme);

    return { erfolg: false, ausgabe: fehlertext };
  }
}

/** Die letzten Zeilen einer Ausgabe — mehr braucht niemand zum Einordnen. */
function schwanz(text: string, zeilen = 40): string {
  return text.split("\n").slice(-zeilen).join("\n");
}

/**
 * Legt die Artikel als Entwürfe ab und prüft den Bestand.
 *
 * Der Build ist hier kein Selbstzweck: Der Loader in `src/lib/wissen/laden.ts`
 * bricht bei jedem Schemaverstoß, jeder Keyword-Dublette und jedem Ankertext ab,
 * der nicht im Text steht. Läuft der Build, ist der Bestand in sich stimmig —
 * das ist die letzte maschinelle Aussage, die vor dem menschlichen Blick möglich
 * ist.
 */
export async function legeAb(artikel: Artikel[]): Promise<AblageErgebnis> {
  const pfade: string[] = [];

  for (const eintrag of artikel) {
    const entwurf: Artikel = {
      ...eintrag,
      status: "entwurf",
      /* Ein Entwurf hat keine Freigabe. Stünde hier eine, wäre die Prüfung im
         Schema wirkungslos — sie verlangt eine Freigabe nur für den Status
         "veroeffentlicht", und der wird hier nie gesetzt. */
      freigabe: undefined,
    };

    try {
      const pfad = schreibeArtikel(entwurf);
      pfade.push(pfad);
      melde(`Entwurf abgelegt: ${pfad}`);
    } catch (ausnahme) {
      fehler(
        `${eintrag.slug} konnte nicht geschrieben werden: ` +
          (ausnahme instanceof Error ? ausnahme.message : String(ausnahme))
      );
    }
  }

  if (pfade.length === 0) {
    return { pfade, testsGruen: false, buildGruen: false, pruefausgabe: "Kein Entwurf abgelegt." };
  }

  melde("Prüfe den Bestand: npm test");
  const test = fuehreAus("test");
  if (!test.erfolg) {
    warne("npm test ist fehlgeschlagen. Die Entwürfe liegen da, sind aber nicht freigabefähig.");
    return {
      pfade,
      testsGruen: false,
      buildGruen: false,
      pruefausgabe: schwanz(test.ausgabe),
    };
  }

  melde("Prüfe den Bestand: npm run build");
  const build = fuehreAus("build");
  if (!build.erfolg) {
    warne("npm run build ist fehlgeschlagen. Die Entwürfe liegen da, sind aber nicht freigabefähig.");
    return {
      pfade,
      testsGruen: true,
      buildGruen: false,
      pruefausgabe: schwanz(build.ausgabe),
    };
  }

  melde(`${pfade.length} Entwurf/Entwürfe abgelegt, Tests und Build sind grün.`);
  melde("Nächster Schritt liegt bei einem Menschen:");
  melde("  1. Entwürfe lesen — sie stehen unter content/wissen/");
  melde("  2. npm run blog:freigeben -- <slug> --von \"Dein Name\"");
  melde("  3. git add content/ && git commit && git push");
  melde("  4. Deploy wie gewohnt über die Coolify-API, nach eigenem Go");

  return { pfade, testsGruen: true, buildGruen: true, pruefausgabe: null };
}

/** Wo ein Entwurf liegt — für die Meldung an den Menschen. */
export function entwurfspfad(slug: string): string {
  return artikelPfad(slug);
}
