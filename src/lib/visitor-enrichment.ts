import { meldeEreignis } from "@/lib/ereignis";

/**
 * Meldet einmal je Sitzung, dass jemand auf der Website ist.
 *
 * **Am 14.08.2026 vollständig neu gebaut.** Was vorher hier stand, war seit dem
 * Umzug wirkungslos und dabei riskant:
 *
 *   - Der Ziel-Webhook `os.kitech-software.de/api/webhook/tracking` **existiert
 *     nicht mehr** — unter der Adresse läuft inzwischen eine andere Anwendung,
 *     der Pfad antwortet mit 404. Jeder zustimmende Besucher löste also eine
 *     Meldung aus, die nirgends ankam.
 *   - Das `ipinfo.io`-Token und ein Webhook-Secret standen **im Quelltext** und
 *     damit im Client-Bundle: für jeden Besucher lesbar, der die Seite ansieht.
 *   - Die IP ging **aus dem Browser des Besuchers direkt** an einen US-Dienst.
 *
 * Jetzt geht die Meldung an die eigene Route `/api/ereignis`. Die Firma wird
 * dort serverseitig nachgeschlagen, mit einem Token, das den Server nie
 * verlässt. Was genau übertragen wird, steht im Kopfkommentar der Route.
 *
 * **Aufgerufen wird das weiterhin nur nach Zustimmung** zur Reichweitenmessung
 * (`CookieConsent.tsx`) — deshalb darf hier `sessionStorage` verwendet werden.
 */

const SESSION_KEY = "visitor-tracked";

export function trackVisitor(): void {
  if (typeof window === "undefined") return;

  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* Kein Speicher (privater Modus): dann eben einmal je Seitenaufruf. */
  }

  meldeEreignis("besuch");
}
