import { hasAnalyticsConsent } from "@/lib/consent";

/**
 * Meldet ein Ereignis an `/api/ereignis` — die Gegenseite der Benachrichtigung,
 * die Ayham bekommt. Die Begründung, was dabei übertragen wird und was nicht,
 * steht im Kopfkommentar des Route Handlers.
 *
 * **Nicht zu verwechseln mit `trackEvent()`** aus `src/lib/plausible.ts`. Die
 * beiden haben verschiedene Aufgaben und laufen bewusst nebeneinander:
 *
 *   | | `trackEvent()` | `meldeEreignis()` |
 *   |---|---|---|
 *   | wohin | Plausible (Statistik) | Webhook → Nachricht an Ayham |
 *   | wozu | Zahlen über alle Besucher | *dieser eine* Moment, sofort |
 *   | ohne Einwilligung | passiert nichts | Ereignis ja, Firmenerkennung nein |
 *
 * An den meisten Stellen gehören beide nebeneinander: die Statistik zählt, die
 * Meldung klingelt.
 */

/** Die Ereignisse, die eine Nachricht wert sind. Muss zum Zod-Schema passen. */
export type Ereignis =
  | "besuch"
  | "termin_geoeffnet"
  | "popup_geklickt"
  | "telefon_geklickt"
  | "email_geklickt"
  | "selbstcheck_fertig";

/**
 * Schon gemeldet? Gilt nur für diese eine geladene Seite.
 *
 * Bewusst eine Variable im Modul und **kein** `sessionStorage`: Zugriff auf den
 * Speicher des Endgeräts würde eine Einwilligung nötig machen (§ 25 TDDDG) und
 * die einwilligungsfreie Meldung genau um das bringen, was sie auszeichnet.
 * Gegen den doppelten Aufruf im React-Entwicklungsmodus (StrictMode rendert
 * Effekte zweimal) reicht sie aus.
 */
const gemeldet = new Set<Ereignis>();

export function meldeEreignis(ereignis: Ereignis, nurEinmal = true): void {
  if (typeof window === "undefined") return;
  if (nurEinmal && gemeldet.has(ereignis)) return;
  gemeldet.add(ereignis);

  const params = new URLSearchParams(window.location.search);

  void fetch("/api/ereignis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ereignis,
      seite: window.location.pathname,
      referrer: document.referrer || null,
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
      mitEinwilligung: hasAnalyticsConsent(),
    }),
    /* Wer sofort weiterklickt, würde die Meldung sonst abbrechen — ausgerechnet
       der schnelle Absprung ginge dann nicht ein. */
    keepalive: true,
  }).catch(() => {
    /* Gemeldet oder nicht — ein Fehlschlag darf weder etwas anzeigen noch
       etwas wiederholen. */
  });
}
