import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

type ConsentStatus = "pending" | "accepted" | "declined";

type ConsentPreferences = {
  analytics: boolean;
};

type StoredConsent = {
  version: 1;
  preferences: ConsentPreferences;
  updatedAt: string;
};

const STORAGE_KEY = "cookie-consent-v1";

/**
 * Plausible Self-Hosted Config
 * Hardcoded – KEIN plausible.io, alles über stats.kitech-software.de
 */
const PLAUSIBLE_DOMAIN = "kitech-software.de";
const PLAUSIBLE_SCRIPT = "https://stats.kitech-software.de/js/script.js";
const PLAUSIBLE_API = "https://stats.kitech-software.de/api/event";

const getDefaultPreferences = (): ConsentPreferences => ({
  analytics: false,
});

const loadStoredConsent = (): StoredConsent | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed?.version !== 1) return null;
    if (typeof parsed?.preferences?.analytics !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
};

const persistConsent = (preferences: ConsentPreferences) => {
  const payload: StoredConsent = {
    version: 1,
    preferences,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

/**
 * Injiziert das Plausible-Script in den <head>.
 * Wird NUR aufgerufen, wenn der User Consent gegeben hat.
 * 
 * - data-domain: kitech-software.de
 * - data-api: https://stats.kitech-software.de/api/event
 * - src: https://stats.kitech-software.de/js/script.js
 * 
 * Das data-plausible="true" Attribut dient als Consent-Marker
 * für die trackEvent()-Funktion in plausible.ts.
 */
const injectPlausible = () => {
  if (typeof document === "undefined") return;
  if (document.querySelector('script[data-plausible="true"]')) return;

  // Event-Queue bereitstellen, damit Events vor Script-Load gepuffert werden
  (window as any).plausible = (window as any).plausible || function(...args: any[]) {
    ((window as any).plausible.q = (window as any).plausible.q || []).push(args);
  };

  const script = document.createElement("script");
  script.defer = true;
  script.src = PLAUSIBLE_SCRIPT;
  script.setAttribute("data-domain", PLAUSIBLE_DOMAIN);
  script.setAttribute("data-api", PLAUSIBLE_API);
  script.setAttribute("data-plausible", "true");
  document.head.appendChild(script);
};

export function CookieConsent() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>("pending");
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(
    getDefaultPreferences(),
  );

  useEffect(() => {
    const stored = loadStoredConsent();
    if (stored) {
      setPreferences(stored.preferences);
      if (stored.preferences.analytics) {
        setConsentStatus("accepted");
        injectPlausible();
      } else {
        setConsentStatus("declined");
      }
      return;
    }

    const timer = setTimeout(() => setShowBanner(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOpen = () => {
      const stored = loadStoredConsent();
      if (stored) {
        setPreferences(stored.preferences);
      }
      setShowSettings(true);
      setShowBanner(true);
    };
    window.addEventListener("cookie-consent:open", handleOpen);
    return () => window.removeEventListener("cookie-consent:open", handleOpen);
  }, []);

  const complianceText = useMemo(
    () => (
      <>
        Wir verwenden notwendige Cookies, um die Website sicher und stabil zu
        betreiben. Mit Ihrer Einwilligung nutzen wir zusätzlich{" "}
        <strong>anonyme Reichweitenmessung</strong> via Plausible Analytics
        (self-hosted in Deutschland). Es werden keine personenbezogenen Profile
        erstellt, kein Dritt‑Tracking und keine Werbung ausgeliefert. Sie können
        Ihre Auswahl jederzeit in der{" "}
        <Link
          to="/datenschutz"
          className="text-primary hover:underline font-medium"
        >
          Datenschutzerklärung
        </Link>{" "}
        ändern.
      </>
    ),
    [],
  );

  const handleAccept = () => {
    const next = { analytics: true };
    persistConsent(next);
    setPreferences(next);
    setConsentStatus("accepted");
    setShowBanner(false);
    injectPlausible();
  };

  const handleDecline = () => {
    const next = { analytics: false };
    persistConsent(next);
    setPreferences(next);
    setConsentStatus("declined");
    setShowBanner(false);
  };

  const handleSaveSettings = () => {
    persistConsent(preferences);
    setConsentStatus(preferences.analytics ? "accepted" : "declined");
    setShowBanner(false);
    if (preferences.analytics) {
      injectPlausible();
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-shrink-0 hidden md:block">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Cookie className="h-7 w-7 text-primary" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Datenschutz & Cookies
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {complianceText}
                  </p>

                  {showSettings && (
                    <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/80 px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">
                            Notwendige Cookies
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Erforderlich für Sicherheit, Seitennavigation und
                            Speicherung Ihrer Auswahl.
                          </p>
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          Immer aktiv
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/80 px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">
                            Statistik (Plausible · self-hosted)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Hilft uns zu verstehen, welche Inhalte nützlich
                            sind. Keine personenbezogenen Daten. Hosted in Deutschland.
                          </p>
                        </div>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={preferences.analytics}
                            onChange={(event) =>
                              setPreferences((prev) => ({
                                ...prev,
                                analytics: event.target.checked,
                              }))
                            }
                            aria-label="Statistik-Cookies aktivieren"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {showSettings ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setShowSettings(false)}
                        className="w-full sm:w-auto"
                      >
                        Zurück
                      </Button>
                      <Button
                        variant="hero"
                        onClick={handleSaveSettings}
                        className="w-full sm:w-auto"
                      >
                        Auswahl speichern
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleDecline}
                        className="w-full sm:w-auto"
                      >
                        Nur notwendige
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowSettings(true)}
                        className="w-full sm:w-auto"
                      >
                        Anpassen
                      </Button>
                      <Button
                        variant="hero"
                        onClick={handleAccept}
                        className="w-full sm:w-auto"
                      >
                        Alle akzeptieren
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
