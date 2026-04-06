/**
 * Plausible Analytics – Self-Hosted Custom Event Tracking
 * 
 * Endpoint: https://stats.kitech-software.de/api/event
 * Script:   https://stats.kitech-software.de/js/script.js
 * Domain:   kitech-software.de
 * 
 * KEIN Request geht an plausible.io – alles self-hosted.
 * Events werden NUR gesendet, wenn der User Consent gegeben hat
 * (= Plausible-Script wurde per CookieConsent injiziert).
 */

const PLAUSIBLE_API = "https://stats.kitech-software.de/api/event";
const PLAUSIBLE_DOMAIN = "kitech-software.de";

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean>; callback?: () => void }
    ) => void;
  }
}

export type PlausibleEvent =
  | "CTA_Klick"
  | "Kontaktformular_gesendet"
  | "Calendly_Klick"
  | "Scroll_90"
  | "Angebot_Seite"
  | "Lead_Qualifier_abgeschlossen"
  | "Telefon_Klick"
  | "Email_Klick";

/**
 * Prüft, ob der User Analytics-Consent gegeben hat.
 * Consent = Plausible-Script wurde in den DOM injiziert.
 */
function hasAnalyticsConsent(): boolean {
  return !!document.querySelector('script[data-plausible="true"]');
}

/**
 * Sendet ein Custom Event an Plausible (self-hosted).
 * 
 * 1. Prüft Consent (kein Tracking ohne Einwilligung)
 * 2. Nutzt window.plausible wenn verfügbar
 * 3. Fallback via sendBeacon (überlebt Navigation)
 */
export function trackEvent(
  event: PlausibleEvent,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  // Primär: Plausible-Script API
  if (window.plausible) {
    window.plausible(event, props ? { props } : undefined);
    return;
  }

  // Fallback: sendBeacon direkt an self-hosted API
  sendBeaconEvent(event, props);
}

/**
 * sendBeacon Fallback – sendet direkt an self-hosted Endpoint.
 * Überlebt sofortige Navigation (Link-Klicks, Seiten-Wechsel).
 */
function sendBeaconEvent(
  event: string,
  props?: Record<string, string | number | boolean>
) {
  if (!navigator.sendBeacon) return;

  const payload = JSON.stringify({
    n: event,
    u: window.location.href,
    d: PLAUSIBLE_DOMAIN,
    r: document.referrer || null,
    p: props ? JSON.stringify(props) : undefined,
  });

  navigator.sendBeacon(PLAUSIBLE_API, payload);
}

/**
 * Scroll-Depth Tracker – feuert EINMALIG bei 90% Scroll-Tiefe.
 * Throttled via passive scroll listener, einmal pro Session.
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
