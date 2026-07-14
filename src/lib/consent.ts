/**
 * Gemeinsame Consent-Logik, geteilt zwischen CookieConsent.tsx (schreibt/liest
 * den vollen State) und Seiten, die nur lesend prüfen müssen (z.B.
 * LassUnsReden.tsx für den Calendly-Consent-Gate).
 */

export const CONSENT_STORAGE_KEY = "cookie-consent-v1";

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
