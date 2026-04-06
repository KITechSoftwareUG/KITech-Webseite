/**
 * Plausible Analytics – Custom Event Tracking
 * 
 * Sendet Events an die Plausible-Instanz (self-hosted oder cloud).
 * Funktioniert nur, wenn der User Analytics-Cookies akzeptiert hat
 * und das Plausible-Script geladen ist.
 */

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> }
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

export function trackEvent(
  event: PlausibleEvent,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(event, props ? { props } : undefined);
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

  // Cleanup-Funktion für React useEffect
  return () => window.removeEventListener("scroll", handler);
}
