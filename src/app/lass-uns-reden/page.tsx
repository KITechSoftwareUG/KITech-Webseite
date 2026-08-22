import { buildMetadata, kuerze } from "@/lib/metadata";
import { angebot, verfuegbarkeit } from "@/config/angebot";
import LassUnsReden from "@/views/LassUnsReden";

/**
 * Titel und Beschreibung kommen aus `src/config/angebot.ts`. Vorher standen sie
 * hier fest verdrahtet — und waren doppelt falsch: "Kostenlose KI-Bewertung" im
 * Titel, "30 Minuten, unverbindlich" in der Beschreibung, dazu ein "Ihrer",
 * obwohl die Seite duzt. Beides war seit der Umstellung auf den einstündigen
 * 1:1-KI-Check überholt, stand aber weiter in der Google-Vorschau.
 */
/* `kuerze` deckelt auf 155 Zeichen: `angebot.beschreibung` ist für die Seite
   geschrieben, nicht für das Suchergebnis, und ergab zusammen mit der
   Verfügbarkeitszeile 220 Zeichen. */
export const metadata = buildMetadata({
  title: `${angebot.name} – kostenlos, ${angebot.dauer}`,
  description: kuerze(`${angebot.beschreibung} ${verfuegbarkeit()}.`),
  path: "/lass-uns-reden",
});

export default function Page() {
  return <LassUnsReden />;
}
