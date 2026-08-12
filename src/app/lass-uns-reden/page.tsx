import { buildMetadata } from "@/lib/metadata";
import { angebot, verfuegbarkeit } from "@/config/angebot";
import LassUnsReden from "@/views/LassUnsReden";

/**
 * Titel und Beschreibung kommen aus `src/config/angebot.ts`. Vorher standen sie
 * hier fest verdrahtet — und waren doppelt falsch: "Kostenlose KI-Bewertung" im
 * Titel, "30 Minuten, unverbindlich" in der Beschreibung, dazu ein "Ihrer",
 * obwohl die Seite duzt. Beides war seit der Umstellung auf den einstündigen
 * 1:1-KI-Check überholt, stand aber weiter in der Google-Vorschau.
 */
export const metadata = buildMetadata({
  title: `${angebot.name} – kostenlos, ${angebot.dauer}`,
  description: `${angebot.beschreibung} ${verfuegbarkeit()}.`,
  path: "/lass-uns-reden",
});

export default function Page() {
  return <LassUnsReden />;
}
