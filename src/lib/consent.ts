/**
 * Gemeinsame Consent-Logik, geteilt zwischen CookieConsent.tsx (schreibt/liest
 * den vollen State) und Seiten, die nur lesend prüfen müssen (z.B.
 * LassUnsReden.tsx für den Calendly-Consent-Gate).
 */

export const CONSENT_STORAGE_KEY = "cookie-consent-v1";

/**
 * Wird gefeuert, sobald der Besucher im Cookie-Banner entschieden hat — egal
 * wie. Gegenstück zu `cookie-consent:open`, mit dem die Fußzeile den Banner
 * wieder aufmacht.
 *
 * Wer darauf hört: `CallPopup` auf der Startseite. Es wartet mit dem eigenen
 * Dialog, bis der Banner weg ist, damit nicht zwei Overlays übereinander
 * liegen und die Einwilligung unbedienbar wird.
 */
export const CONSENT_DECIDED_EVENT = "cookie-consent:entschieden";

type StoredConsent = {
  version: 1;
  preferences: { analytics: boolean };
  updatedAt: string;
};

export function loadStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed?.version !== 1) return null;
    if (typeof parsed?.preferences?.analytics !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return loadStoredConsent()?.preferences.analytics === true;
}
