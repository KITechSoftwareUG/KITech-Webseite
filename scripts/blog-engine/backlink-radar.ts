/* Muss der erste Import bleiben: fuellt process.env aus .env, bevor ein
   anderes Modul nach einem Zugang fragt. Siehe lib/umgebung.ts. */
import "./lib/umgebung.js";
import fs from "node:fs";
import path from "node:path";
import {
  backlinkWettbewerber,
  verweisendeDomains,
  backlinkZusammenfassung,
} from "./lib/dataforseo.js";
import { melde, warne, fehler } from "./lib/protokoll.js";

/**
 * Backlink-Radar — findet Gelegenheiten für Ansprache durch Menschen.
 *
 * ⚠️ **Dieses Werkzeug baut keine Links. Es kann keine bauen, und es soll keine
 * bauen.** Googles Link-Spam-Richtlinie nennt wörtlich als Verstoß:
 *
 * > „Using automated programs or services to create links to your site"
 *
 * und ebenso
 *
 * > „Advertorials or native advertising where payment is received for articles
 * > that include links that pass ranking credit, or links with optimized anchor
 * > text in articles, guest posts, or press releases distributed on other sites"
 *
 * Was dieses Werkzeug tut, ist Recherche: Es sucht Domains, die auf mehrere
 * Wettbewerber verweisen und nicht auf uns. Wer dort verlinkt, hat sich schon
 * einmal für dieses Thema interessiert — das ist eine brauchbare Liste für einen
 * Menschen, der jemandem schreibt. Wer daraus einen automatischen Linkaufbau
 * macht, verstößt gegen die zitierte Regel.
 *
 * **Was legitim ist**, aus derselben Richtlinie abgeleitet: eigene Daten, die
 * jemand freiwillig zitiert; Fachverbands- und Kammerverzeichnisse mit echter
 * Mitgliedschaft; Presseanfrage-Dienste; Podcast- und Vortragsauftritte; bezahlte
 * Platzierungen, die mit `rel="sponsored"` gekennzeichnet sind.
 *
 * **Ein Hinweis zur Erwartung:** In einer Auswertung von 75.000 Marken hing die
 * Sichtbarkeit in KI-Antworten deutlich stärker mit **Erwähnungen** zusammen
 * (Marken-Nennungen im Web, YouTube) als mit Backlinks. Das sind Korrelationen,
 * keine Kausalität — aber sie verschieben die Frage von „wer verlinkt uns?" zu
 * „wo wird über uns geredet?".
 *
 * ```
 * npm run blog:backlinks
 * npm run blog:backlinks -- --limit 200
 * ```
 */

const EIGENE_DOMAIN = "kitech-software.de";
const WETTBEWERBER_DATEI = path.join(process.cwd(), "content", "seo", "wettbewerber.json");
const ZIEL_JSON = path.join(process.cwd(), "content", "seo", "backlink-ziele.json");
const ZIEL_MARKDOWN = path.join(process.cwd(), "content", "seo", "backlink-ziele.md");

interface Wettbewerberliste {
  /** Domains ohne Schema und ohne www. */
  domains: string[];
  notiz?: string;
}

interface Gelegenheit {
  domain: string;
  /** Auf wie viele der beobachteten Wettbewerber diese Domain verweist. */
  wettbewerber: string[];
  rang: number;
  spamScore: number;
  /** Wie viele Links insgesamt von dieser Domain kommen. */
  backlinks: number;
  /** Wie viele davon Rankingsignal weitergeben. Nofollow-Links zählen nicht. */
  dofollow: number;
}

function ladeWettbewerber(): Wettbewerberliste {
  if (!fs.existsSync(WETTBEWERBER_DATEI)) {
    const vorlage: Wettbewerberliste = {
      domains: [],
      notiz:
        "Domains ohne Schema und ohne www, z. B. \"beispiel-agentur.de\". Drei bis acht " +
        "Wettbewerber genügen — mehr kostet Geld und bringt kaum neue Namen. Wer hier " +
        "steht, sollte tatsächlich um dieselben Suchbegriffe konkurrieren, nicht nur in " +
        "derselben Branche sein.",
    };

    fs.mkdirSync(path.dirname(WETTBEWERBER_DATEI), { recursive: true });
    fs.writeFileSync(WETTBEWERBER_DATEI, JSON.stringify(vorlage, null, 2) + "\n", "utf8");

    melde(`Vorlage angelegt: ${path.relative(process.cwd(), WETTBEWERBER_DATEI)}`);
    return vorlage;
  }

  const roh = JSON.parse(fs.readFileSync(WETTBEWERBER_DATEI, "utf8")) as Wettbewerberliste;
  return { domains: roh.domains ?? [], notiz: roh.notiz };
}

function leseLimit(argv: string[]): number {
  const index = argv.indexOf("--limit");
  if (index === -1) return 100;
  return Math.min(1000, Math.max(10, Number(argv[index + 1]) || 100));
}

async function main(): Promise<number> {
  const limit = leseLimit(process.argv.slice(2));
  const liste = ladeWettbewerber();

  if (liste.domains.length === 0) {
    warne("Keine Wettbewerber eingetragen.");
    melde("");
    melde(`Trage drei bis acht Domains in ${path.relative(process.cwd(), WETTBEWERBER_DATEI)} ein.`);
    melde("Wer dort hineingehört: Anbieter, die für dieselben Suchbegriffe ranken — nicht");
    melde("einfach Firmen derselben Branche. Die Ergebnisseiten aus dem letzten Blog-Lauf");
    melde("sind die beste Quelle dafür (siehe content/seo/laeufe/).");
    return 1;
  }

  melde(`${liste.domains.length} Wettbewerber, Grenze ${limit} verweisende Domains je Ziel`);

  /* Zuerst die eigenen verweisenden Domains — sie werden am Ende abgezogen. Wer
     uns schon verlinkt, ist keine Gelegenheit mehr. */
  let eigene = new Set<string>();
  try {
    const meine = await verweisendeDomains(EIGENE_DOMAIN, limit * 2);
    eigene = new Set(meine.map((eintrag) => eintrag.domain.toLowerCase()));
    melde(`${eigene.size} Domain(s) verweisen bereits auf ${EIGENE_DOMAIN}`);
  } catch (ausnahme) {
    warne(
      "Eigenes Backlink-Profil nicht abrufbar — die Liste enthält dann womöglich Domains, " +
        "die uns schon verlinken: " +
        (ausnahme instanceof Error ? ausnahme.message : String(ausnahme))
    );
  }

  const gesammelt = new Map<string, Gelegenheit>();

  for (const domain of liste.domains) {
    melde(`Lese verweisende Domains von ${domain} …`);

    try {
      const verweise = await verweisendeDomains(domain, limit);

      for (const eintrag of verweise) {
        const schluessel = eintrag.domain.toLowerCase();

        /* Verlorene Verbindungen sind keine Gelegenheit im selben Sinn: Wer einen
           Wettbewerber nicht mehr verlinkt, hat sich meist bewusst getrennt. */
        if (eintrag.verlorenAm) continue;
        if (eigene.has(schluessel)) continue;
        if (schluessel.includes(EIGENE_DOMAIN)) continue;
        if (liste.domains.some((w) => schluessel.includes(w.toLowerCase()))) continue;

        const vorhanden = gesammelt.get(schluessel);
        if (vorhanden) {
          if (!vorhanden.wettbewerber.includes(domain)) vorhanden.wettbewerber.push(domain);
          continue;
        }

        gesammelt.set(schluessel, {
          domain: eintrag.domain,
          wettbewerber: [domain],
          rang: eintrag.rang ?? 0,
          spamScore: eintrag.spamScore ?? 0,
          backlinks: eintrag.backlinks ?? 0,
          dofollow: eintrag.dofollow ?? 0,
        });
      }
    } catch (ausnahme) {
      warne(
        `${domain} übersprungen: ` +
          (ausnahme instanceof Error ? ausnahme.message : String(ausnahme))
      );
    }
  }

  /* Nur Domains, die auf mindestens zwei Wettbewerber zeigen. Eine einzelne
     Verbindung kann jede Ursache haben — eine Mehrfachverbindung ist ein
     Hinweis darauf, dass die Domain dieses Thema regelmäßig behandelt. */
  const gelegenheiten = [...gesammelt.values()]
    .filter((eintrag) => eintrag.wettbewerber.length >= 2)
    /* Ein hoher Spam-Wert bedeutet meist ein Verzeichnis oder eine Linkfarm.
       Solche Verbindungen sind wertlos und im Zweifel schädlich. */
    .filter((eintrag) => eintrag.spamScore < 30)
    .sort(
      (a, b) =>
        b.wettbewerber.length - a.wettbewerber.length || b.rang - a.rang
    );

  if (gelegenheiten.length === 0) {
    melde("Keine Domain verweist auf mehrere Wettbewerber, ohne uns zu kennen.");
    return 0;
  }

  fs.writeFileSync(ZIEL_JSON, JSON.stringify(gelegenheiten, null, 2) + "\n", "utf8");

  const markdown = [
    "# Backlink-Gelegenheiten",
    "",
    `Erhoben am ${new Date().toISOString().slice(0, 10)} über ${liste.domains.length} Wettbewerber.`,
    "",
    "**Was das hier ist:** Domains, die auf mindestens zwei der beobachteten Wettbewerber",
    "verweisen und nicht auf uns. Wer dort verlinkt, hat sich schon einmal für dieses Thema",
    "interessiert.",
    "",
    "**Was das hier nicht ist:** eine Liste zum Abarbeiten. Googles Link-Spam-Richtlinie",
    "verbietet ausdrücklich, Links durch automatisierte Dienste erzeugen zu lassen, und",
    "ebenso bezahlte Gastbeiträge mit optimiertem Ankertext. Was bleibt, ist Ansprache durch",
    "einen Menschen — mit einem Grund, der für die Gegenseite trägt.",
    "",
    "| Domain | Verweist auf | Rang | Spam | Links (davon dofollow) |",
    "|---|---|---|---|---|",
    ...gelegenheiten
      .slice(0, 80)
      .map(
        (eintrag) =>
          `| ${eintrag.domain} | ${eintrag.wettbewerber.length} (${eintrag.wettbewerber.join(", ")}) | ` +
          `${eintrag.rang} | ${eintrag.spamScore} | ${eintrag.backlinks} (${eintrag.dofollow}) |`
      ),
    "",
    "## Wie man damit umgeht",
    "",
    "1. Ansehen, **was** die Domain über die Wettbewerber geschrieben hat. Ein Verzeichnis-",
    "   eintrag ist etwas anderes als ein redaktioneller Beitrag.",
    "2. Prüfen, ob es einen echten Anlass gibt: eigene Zahlen, ein Werkzeug, eine Erfahrung,",
    "   die dort fehlt. Ohne Anlass keine Ansprache.",
    "3. Schreiben — als Mensch, mit dem Anlass, ohne Linkbitte im ersten Satz.",
    "4. Was nichts wird, wird nichts. Nachfassen höchstens einmal.",
    "",
    "Nicht vergessen: In den vorliegenden Auswertungen hängt Sichtbarkeit in KI-Antworten",
    "stärker mit **Erwähnungen** zusammen als mit Backlinks. Eine Nennung ohne Link ist",
    "deshalb kein Misserfolg.",
    "",
  ].join("\n");

  fs.writeFileSync(ZIEL_MARKDOWN, markdown, "utf8");

  melde("");
  melde(`${gelegenheiten.length} Gelegenheit(en) gefunden.`);
  melde(`  ${path.relative(process.cwd(), ZIEL_JSON)}`);
  melde(`  ${path.relative(process.cwd(), ZIEL_MARKDOWN)}`);

  /* Zum Einordnen: das eigene Profil daneben. */
  try {
    const eigenesProfil = await backlinkZusammenfassung(EIGENE_DOMAIN);
    melde("");
    melde(
      `Eigenes Profil: ${eigenesProfil.verweisendeDomains} verweisende Domain(s), ` +
        `Rang ${eigenesProfil.rang}, Spam-Wert ${eigenesProfil.spamScore}`
    );
  } catch {
    /* Nur eine Einordnung — ihr Fehlen ist kein Grund, den Lauf zu verwerfen. */
  }

  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((ausnahme: unknown) => {
    fehler(ausnahme instanceof Error ? ausnahme.message : String(ausnahme));
    process.exit(1);
  });

/* `backlinkWettbewerber` bleibt bewusst importiert: Die Wettbewerberliste von
   Hand zu pflegen ist der Normalfall, aber wer sie einmal automatisch füllen
   will, findet die Funktion hier und muss nicht suchen. */
void backlinkWettbewerber;
