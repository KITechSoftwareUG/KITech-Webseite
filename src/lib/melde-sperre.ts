import type { NextRequest } from "next/server";

/**
 * Sperre gegen Dauerfeuer auf den öffentlichen Melde-Routen.
 *
 * Ohne sie könnte jemand eine Route in einer Schleife aufrufen und damit das
 * Postfach oder den Messenger dahinter fluten — die Endpunkte sind öffentlich
 * und ohne Anmeldung erreichbar, das lässt sich bei einer Website nicht ändern.
 *
 * Der Speicher liegt im Prozess: die Seite läuft als **ein** Node-Server im
 * Container (siehe `Dockerfile`, `output: "standalone"`). Bei mehreren
 * Instanzen müsste der Zähler nach außen wandern — dann ist aber ohnehin ein
 * Speicher mit Persistenz die richtige Antwort und nicht diese Map.
 *
 * ℹ️ `src/app/api/funnel-besuch/route.ts` trägt dieselbe Logik noch inline.
 * Wer die beiden Routen zusammenlegt, stellt sie auf diese Datei um.
 */

const FENSTER_MS = 10 * 60 * 1000;

/** Ein Zähler je Zweck, damit sich zwei Routen nicht gegenseitig aussperren. */
const zaehlerJeZweck = new Map<string, Map<string, { anzahl: number; bis: number }>>();

/**
 * Darf diese Kennung noch melden?
 *
 * @param zweck    Name der Route — trennt die Kontingente.
 * @param kennung  Siehe {@link kennungVon}.
 * @param maximum  Meldungen pro Zehn-Minuten-Fenster.
 */
export function darfMelden(zweck: string, kennung: string, maximum: number): boolean {
  const jetzt = Date.now();
  let zaehler = zaehlerJeZweck.get(zweck);
  if (!zaehler) {
    zaehler = new Map();
    zaehlerJeZweck.set(zweck, zaehler);
  }

  const eintrag = zaehler.get(kennung);

  if (!eintrag || eintrag.bis < jetzt) {
    zaehler.set(kennung, { anzahl: 1, bis: jetzt + FENSTER_MS });

    /* Abgelaufene Einträge im Vorbeigehen wegräumen, damit die Map nicht
       unbegrenzt wächst. Bei diesen Besucherzahlen reicht das. */
    if (zaehler.size > 1000) {
      for (const [schluessel, wert] of zaehler) {
        if (wert.bis < jetzt) zaehler.delete(schluessel);
      }
    }
    return true;
  }

  if (eintrag.anzahl >= maximum) return false;

  eintrag.anzahl += 1;
  return true;
}

/**
 * Kennung für die Sperre — die IP, sonst der User-Agent als schwacher Ersatz.
 *
 * ⚠️ `x-forwarded-for` setzt der Reverse Proxy davor (Coolify/Traefik), aber der
 * Header ist grundsätzlich fälschbar: wer ihn bei jeder Anfrage variiert,
 * bekommt jedes Mal ein frisches Kontingent. Die Sperre schützt gegen
 * versehentliches Dauerfeuer und simple Skripte, nicht gegen jemanden, der sie
 * gezielt umgehen will.
 */
export function kennungVon(request: NextRequest): string {
  const weitergeleitet = request.headers.get("x-forwarded-for");
  if (weitergeleitet) return weitergeleitet.split(",")[0].trim();
  return request.headers.get("user-agent") ?? "unbekannt";
}

/**
 * Die IP des Besuchers, wie der Proxy sie meldet — oder `null`.
 *
 * Getrennt von {@link kennungVon}, weil das hier eine **andere Verwendung** ist:
 * die Kennung bleibt im Arbeitsspeicher, diese IP geht an einen Dienst zur
 * Firmenerkennung. Wer die beiden zusammenwirft, verliert genau die Grenze, an
 * der die Einwilligung hängt.
 */
export function ipVon(request: NextRequest): string | null {
  const weitergeleitet = request.headers.get("x-forwarded-for");
  if (weitergeleitet) {
    const erste = weitergeleitet.split(",")[0].trim();
    if (erste) return erste;
  }
  return request.headers.get("x-real-ip");
}
