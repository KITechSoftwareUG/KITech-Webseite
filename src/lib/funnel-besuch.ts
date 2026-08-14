/**
 * Meldet einen Aufruf der Kampagnenseiten an `/api/funnel-besuch`.
 *
 * Gegenstück zum Route Handler dort — die Begründung, warum das nicht am
 * Cookie-Banner hängt und was bewusst *nicht* übertragen wird, steht in
 * `src/app/api/funnel-besuch/route.ts`.
 *
 * Zwei Dinge sind hier wichtig:
 *
 *   - **Kein `sessionStorage`.** Das bestehende `trackVisitor()` merkt sich
 *     dort, dass es schon gelaufen ist. Genau dieser Zugriff auf den Speicher
 *     des Endgeräts macht eine Einwilligung nötig (§ 25 TDDDG). Gegen den
 *     doppelten Aufruf im React-Entwicklungsmodus (StrictMode rendert Effekte
 *     zweimal) reicht eine Variable im Modul — sie lebt genau so lange wie die
 *     geladene Seite und hinterlässt nichts.
 *   - **`keepalive`.** Wer sofort weiterklickt, würde die Meldung sonst
 *     abbrechen — ausgerechnet der schnelle Absprung ginge dann nicht in die
 *     Zählung ein.
 */

/** Bereits gemeldet? Gilt nur für diese eine geladene Seite. */
let gemeldet = false;

export function meldeFunnelBesuch(seite: "/funnel" | "/fokus"): void {
  if (typeof window === "undefined" || gemeldet) return;
  gemeldet = true;

  const params = new URLSearchParams(window.location.search);

  void fetch("/api/funnel-besuch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      seite,
      referrer: document.referrer || null,
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
    }),
    keepalive: true,
    /* Der Besuch ist gezählt oder nicht — eine fehlgeschlagene Meldung darf
       weder etwas anzeigen noch etwas wiederholen. */
  }).catch(() => {});
}
