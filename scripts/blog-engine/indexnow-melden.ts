import { veroeffentlichteArtikel, alleCluster, artikelImCluster } from "../../src/lib/wissen/laden.js";
import { meldeUrls, betroffeneUrls, schreibeKeyDatei } from "./lib/indexnow.js";
import { melde, fehler } from "./lib/protokoll.js";

/**
 * Neue Adressen an IndexNow melden — **nach** dem Deploy.
 *
 * ```
 * npm run blog:indexnow -- --keydatei        # einmalig: Prüfdatei anlegen
 * npm run blog:indexnow -- --seit 2026-08-19 # alles ab diesem Datum
 * npm run blog:indexnow -- <slug> [<slug>]   # bestimmte Artikel
 * ```
 *
 * ⚠️ **Erst deployen, dann melden.** Der Dienst ruft die gemeldeten Adressen ab.
 * Was noch nicht ausgeliefert ist, liefert eine 404 — und eine gemeldete
 * Adresse, die nicht existiert, ist schlechter als eine ungemeldete.
 *
 * Und noch einmal, weil es die häufigste Fehlannahme ist: **Google nimmt nicht
 * teil.** Empfänger sind Bing, Yandex, Seznam, Naver, Yep, das Internet Archive
 * und Amazonbot. Für Google bleibt die Sitemap.
 */

interface Argumente {
  slugs: string[];
  seit: string | null;
  keydatei: boolean;
  hilfe: boolean;
}

function leseArgumente(argv: string[]): Argumente {
  const args: Argumente = { slugs: [], seit: null, keydatei: false, hilfe: false };

  for (let i = 0; i < argv.length; i += 1) {
    const wert = argv[i];
    if (wert === "--seit") args.seit = argv[++i] ?? null;
    else if (wert === "--keydatei") args.keydatei = true;
    else if (wert === "--hilfe" || wert === "-h") args.hilfe = true;
    else if (!wert.startsWith("--")) args.slugs.push(wert);
  }

  return args;
}

async function main(): Promise<number> {
  const args = leseArgumente(process.argv.slice(2));

  if (args.hilfe) {
    process.stdout.write(
      [
        "",
        "Adressen an IndexNow melden (Bing, Yandex, Seznam, Naver, Yep,",
        "Internet Archive, Amazonbot — nicht Google).",
        "",
        "  npm run blog:indexnow -- --keydatei",
        "  npm run blog:indexnow -- --seit 2026-08-19",
        "  npm run blog:indexnow -- <slug> [<slug> …]",
        "",
        "Ohne Angabe werden die Artikel der letzten sieben Tage gemeldet.",
        "Erst deployen, dann melden.",
        "",
      ].join("\n")
    );
    return 0;
  }

  if (args.keydatei) {
    try {
      schreibeKeyDatei();
      melde("");
      melde("Die Datei muss mit dem nächsten Deploy live gehen, sonst weist der Dienst");
      melde("jede Meldung mit 403 ab.");
      return 0;
    } catch (ausnahme) {
      fehler(ausnahme instanceof Error ? ausnahme.message : String(ausnahme));
      return 1;
    }
  }

  const alle = veroeffentlichteArtikel();

  /* Ohne Angabe: die letzten sieben Tage. Das deckt einen normalen Deploy-Takt
     ab, ohne bei jedem Aufruf den ganzen Bestand zu melden — was zwar erlaubt
     wäre, aber nichts bringt. */
  const grenze =
    args.seit ??
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const betroffen =
    args.slugs.length > 0
      ? alle.filter((artikel) => args.slugs.includes(artikel.slug))
      : alle.filter((artikel) => artikel.aktualisiert >= grenze);

  if (betroffen.length === 0) {
    melde(
      args.slugs.length > 0
        ? "Keiner der genannten Slugs ist veröffentlicht."
        : `Kein Artikel seit ${grenze} veröffentlicht oder geändert.`
    );
    return 0;
  }

  /* Betroffene Themenseiten mitmelden: Erscheint ein Artikel, ändert sich seine
     Themenseite ebenfalls — und die ist eine Einstiegsseite. */
  const clusterSlugs = [
    ...new Set(
      betroffen
        .map((artikel) => artikel.cluster)
        .filter((slug) => alleCluster().some((c) => c.slug === slug && artikelImCluster(slug).length > 0))
    ),
  ];

  const urls = betroffeneUrls(
    betroffen.map((artikel) => artikel.slug),
    clusterSlugs
  );

  melde(`${urls.length} Adresse(n) werden gemeldet:`);
  for (const url of urls) melde(`  ${url}`);

  const ok = await meldeUrls(urls);
  return ok ? 0 : 1;
}

main()
  .then((code) => process.exit(code))
  .catch((ausnahme: unknown) => {
    fehler(ausnahme instanceof Error ? ausnahme.message : String(ausnahme));
    process.exit(1);
  });
