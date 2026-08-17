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

type Seite = "/funnel" | "/fokus";

/** Bereits gemeldet? Gilt nur für diese eine geladene Seite. */
let gemeldet = false;
/** Die Lesemeldung geht ebenfalls höchstens einmal raus. */
let leseMeldungRaus = false;

function sende(seite: Seite, ereignis: "aufruf" | "gelesen"): void {
  const params = new URLSearchParams(window.location.search);

  void fetch("/api/funnel-besuch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      seite,
      ereignis,
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

/**
 * Meldet, sobald jemand 90 % der Seite gesehen hat.
 *
 * Zusammen mit der Aufrufmeldung ergibt das die Zahl, die auf einer langen
 * Landingpage wirklich zählt: wie viele lesen bis zum Ende — und klicken
 * trotzdem nicht. Rechnet in `requestAnimationFrame`, damit das Scrollen
 * flüssig bleibt, und hängt sich nach der einen Meldung selbst wieder aus.
 *
 * Gibt eine Aufräumfunktion zurück (für `useEffect`).
 */
export function beobachteLesetiefe(seite: Seite): () => void {
  if (typeof window === "undefined") return () => {};

  let laeuft = false;

  const pruefen = () => {
    if (laeuft) return;
    laeuft = true;

    window.requestAnimationFrame(() => {
      laeuft = false;
      if (leseMeldungRaus) return;

      const hoehe = document.documentElement.scrollHeight - window.innerHeight;
      if (hoehe <= 0) return;

      if ((window.scrollY / hoehe) * 100 >= 90) {
        leseMeldungRaus = true;
        sende(seite, "gelesen");
        window.removeEventListener("scroll", pruefen);
      }
    });
  };

  window.addEventListener("scroll", pruefen, { passive: true });
  return () => window.removeEventListener("scroll", pruefen);
}

export function meldeFunnelBesuch(seite: Seite): void {
  if (typeof window === "undefined" || gemeldet) return;
  gemeldet = true;

  sende(seite, "aufruf");
}
