import { existsSync } from "node:fs";
import path from "node:path";
import { buildMetadata } from "@/lib/metadata";
import Home from "@/views/Home";

export const metadata = buildMetadata({
  title: "KITech Software – Anwendungspartner für KI im Mittelstand",
  description:
    "99 % der KI-Projekte scheitern an der falschen KI. Wir sind euer Anwendungspartner und verändern, wie KI in eurem Unternehmen tatsächlich eingesetzt wird. Kostenlose Bewertung eurer KI-Aufstellung — 60 Minuten, 5 Plätze pro Woche.",
  path: "/",
});

/**
 * Pfad des Hero-Portraits: die freigestellte Aufnahme von Ayham, seit dem
 * 12.08.2026 im Repo (`src/assets/portrait_Ayham.svg` als Quelle, daraus
 * getrimmt und auf 700 px Höhe gerechnet — 40 KB statt 1 MB).
 *
 * Die Prüfung läuft **hier**, in der Server Component, und damit beim Build:
 * liegt die Datei, wird sie ausgeliefert; liegt sie nicht, fällt die Startseite
 * auf das vorhandene Team-Portrait zurück. Ein `<picture>`-Element hätte das
 * nicht geleistet — es wählt nach Dateityp, nicht danach, ob die Datei
 * existiert, und hätte bei fehlender Datei ein kaputtes Bild gezeigt.
 */
const HERO_PORTRAIT = "/images/ayham-hero.webp";
const heroPortrait = existsSync(path.join(process.cwd(), "public", HERO_PORTRAIT))
  ? HERO_PORTRAIT
  : null;

export default function Page() {
  return <Home heroPortrait={heroPortrait} />;
}
