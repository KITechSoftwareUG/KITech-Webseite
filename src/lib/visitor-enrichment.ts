/**
 * Visitor Enrichment – ruft ipinfo.io direkt im Browser auf,
 * schickt angereicherte Daten einmal pro Session an n8n.
 * Wird NUR nach Analytics-Consent aufgerufen.
 */

const IPINFO_TOKEN = "7df240b3cb05e7";
const WEBHOOK_URL =
  "https://k01-2025-u36730.vm.elestio.app/webhook/1c93e1da-6dfc-4af5-a55a-8f9220af52de";
const SESSION_KEY = "visitor-tracked";

export async function trackVisitor(): Promise<void> {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(SESSION_KEY)) return;
  sessionStorage.setItem(SESSION_KEY, "1");

  const params = new URLSearchParams(window.location.search);

  // IP-Enrichment via ipinfo.io Lite (kein IP-Parameter = eigene IP)
  let ipData: Record<string, string> = {};
  try {
    const res = await fetch(
      `https://ipinfo.io/json?token=${IPINFO_TOKEN}`
    );
    ipData = await res.json();
  } catch {
    // kein Enrichment, trotzdem Besuch tracken
  }

  const payload = {
    page: window.location.pathname,
    referrer: document.referrer || null,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    ip: ipData.ip ?? null,
    org: ipData.org ?? null,
    city: ipData.city ?? null,
    region: ipData.region ?? null,
    country: ipData.country ?? null,
    hostname: ipData.hostname ?? null,
  };

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // silent fail
  }
}
