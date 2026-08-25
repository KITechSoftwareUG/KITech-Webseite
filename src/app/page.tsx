import { existsSync } from "node:fs";
import path from "node:path";
import { buildMetadata } from "@/lib/metadata";
import Home from "@/views/Home";
import { empfehlungenFuer } from "@/lib/wissen/empfehlungen";

/**
 * Beschreibung neu gefasst am 20.08.2026 — aus zwei Gründen.
 *
 * Sie war mit 230 Zeichen deutlich zu lang und wurde im Suchergebnis hinten
 * abgeschnitten, also genau dort, wo das Angebot stand. Und sie eröffnete mit
 * „99 % der KI-Projekte scheitern an der falschen KI" — eine harte Zahl **ohne
 * Quelle, die auf der Seite selbst an keiner Stelle vorkommt**. Ein Ausschnitt,
 * der etwas verspricht, was die Seite nicht sagt, ist doppelt ungünstig: als
 * unbelegte Werbeaussage und als Erwartung, die der erste Blick enttäuscht.
 *
 * Was jetzt dort steht, steht auch auf der Seite: die Aussage aus dem Hero und
 * das Angebot aus `angebot.ts`.
 */
export const metadata = buildMetadata({
  title: "KITech Software – Anwendungspartner für KI im Mittelstand",
  description:
    "Falsche KI kostet mehr als keine KI. Wir bauen Automatisierungen und Software, die im Tagesgeschäft läuft — Hannover. Kostenloser 1:1-KI-Check, 30 Minuten.",
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
const HERO_PORTRAIT = "/images/team/ayham-hero.webp";
const heroPortrait = existsSync(path.join(process.cwd(), "public", HERO_PORTRAIT))
  ? HERO_PORTRAIT
  : null;

export default function Page() {
  return <Home heroPortrait={heroPortrait} wissen={empfehlungenFuer("/")} />;
}
