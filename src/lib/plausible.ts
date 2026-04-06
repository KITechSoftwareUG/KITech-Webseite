/**
 * Plausible Analytics – Custom Event Tracking
 * 
 * Sendet Events an die Plausible-Instanz (self-hosted oder cloud).
 * Verwendet sendBeacon als Fallback, damit Events auch bei
 * sofortiger Navigation (Link-Klicks) nicht abgebrochen werden.
 */

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean>; callback?: () => void }
    ) => void;
  }
}

type PlausibleEvent =
  | "CTA_Klick"
  | "Kontaktformular_gesendet"
  | "Calendly_Klick"
  | "Scroll_90"
  | "Lead_Qualifier_abgeschlossen"
  | "Telefon_Klick"
  | "Email_Klick";

/**
 * Sendet ein Custom Event an Plausible.
 * Nutzt window.plausible wenn verfügbar, sonst sendBeacon als Fallback.
 */
export function trackEvent(
  event: PlausibleEvent,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;

  // Versuche zuerst über das Plausible-Script
  if (window.plausible) {
    window.plausible(event, props ? { props } : undefined);
  }

  // Zusätzlich via sendBeacon als Backup (überlebt Navigation)
  sendBeaconEvent(event, props);
}

function sendBeaconEvent(
  event: string,
  props?: Record<string, string | number | boolean>
) {
  if (!navigator.sendBeacon) return;

  const domain =
    (import.meta as any).env?.VITE_PLAUSIBLE_DOMAIN?.trim() ||
    window.location.hostname;
  const apiHost =
    (import.meta as any).env?.VITE_PLAUSIBLE_API_HOST?.trim();

  const payload = JSON.stringify({
    n: event,
    u: window.location.href,
    d: domain,
    r: document.referrer || null,
    p: props ? JSON.stringify(props) : undefined,
  });

  // An self-hosted Instanz senden
  if (apiHost) {
    navigator.sendBeacon(apiHost, payload);
  }
}

/**
 * Scroll-Depth Tracker – feuert einmalig bei 90% Scroll-Tiefe
 */
export function initScrollTracking() {
  if (typeof window === "undefined") return;

  let fired = false;

  const handler = () => {
    if (fired) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0 && scrollTop / docHeight >= 0.9) {
      fired = true;
      trackEvent("Scroll_90");
      window.removeEventListener("scroll", handler);
    }
  };

  window.addEventListener("scroll", handler, { passive: true });

  return () => window.removeEventListener("scroll", handler);
}
