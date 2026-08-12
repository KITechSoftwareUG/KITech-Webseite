import { existsSync } from "node:fs";
import path from "node:path";
import { buildMetadata } from "@/lib/metadata";
import Home from "@/views/Home";

export const metadata = buildMetadata({
  title: "KITech Software – Anwendungspartner für KI im Mittelstand",
  description:
    "99 % der KI-Projekte scheitern an der falschen KI. Wir sind euer Anwendungspartner und verändern, wie KI in eurem Unternehmen tatsächlich eingesetzt wird. Kostenloses Erstgespräch buchen.",
  path: "/",
});

/**
 * Pfad des Hero-Portraits. Ayham liefert die freigestellte Aufnahme unter
 * `public/images/ayham-hero.png` nach.
 *
 * Die Prüfung läuft **hier**, in der Server Component, und damit beim Build:
 * liegt die Datei, wird sie ausgeliefert; liegt sie nicht, fällt die Startseite
 * auf das vorhandene Team-Portrait zurück. Ein `<picture>`-Element hätte das
 * nicht geleistet — es wählt nach Dateityp, nicht danach, ob die Datei
 * existiert, und hätte bei fehlender Datei ein kaputtes Bild gezeigt.
 *
 * Sobald die Aufnahme im Repo liegt, greift sie beim nächsten Build von selbst.
 */
const HERO_PORTRAIT = "/images/ayham-hero.png";
const heroPortrait = existsSync(path.join(process.cwd(), "public", HERO_PORTRAIT))
  ? HERO_PORTRAIT
  : null;

export default function Page() {
  return <Home heroPortrait={heroPortrait} />;
}
