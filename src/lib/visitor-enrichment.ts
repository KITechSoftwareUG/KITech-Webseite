const IPINFO_TOKEN = "7df240b3cb05e7";
const WEBHOOK_URL = "https://os.kitech-software.de/api/webhook/tracking";
const WEBHOOK_SECRET = "e65eab0e64f35a1e07859730c4ddd95119f22941dc983c5b40d08aeb78d911c4";
const SESSION_KEY = "visitor-tracked";

export async function trackVisitor(): Promise<void> {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(SESSION_KEY)) return;
  sessionStorage.setItem(SESSION_KEY, "1");

  const params = new URLSearchParams(window.location.search);

  let ipData: Record<string, string> = {};
  try {
    const res = await fetch(`https://ipinfo.io/json?token=${IPINFO_TOKEN}`);
    ipData = await res.json();
  } catch {
    // kein Enrichment, trotzdem tracken
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
      headers: {
        "Content-Type": "application/json",
        ...(WEBHOOK_SECRET ? { "x-tracking-secret": WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // silent fail
  }
}
