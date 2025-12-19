import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

type ConsentStatus = "pending" | "accepted" | "declined";

export function CookieConsent() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>("pending");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem("cookie-consent");
    if (savedConsent === "accepted" || savedConsent === "declined") {
      setConsentStatus(savedConsent);
      if (savedConsent === "accepted") {
        enableTracking();
      }
    } else {
      // Show banner after short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const enableTracking = () => {
    // Enable GTM dataLayer
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "consent_granted",
        consent: {
          analytics: true,
          marketing: true,
        },
      });
    }
  };

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setConsentStatus("accepted");
    setShowBanner(false);
    enableTracking();
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setConsentStatus("declined");
    setShowBanner(false);
  };

  const handleClose = () => {
    setShowBanner(false);
  };

  if (consentStatus !== "pending" || !showBanner) {
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
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Schließen"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-shrink-0 hidden md:block">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Cookie className="h-7 w-7 text-primary" />
                  </div>
                </div>

                <div className="flex-1 pr-8 md:pr-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Cookie-Einstellungen
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern 
                    und anonymisierte Nutzungsstatistiken zu erheben. Mit "Akzeptieren" stimmen 
                    Sie der Verwendung von Cookies zu. Weitere Informationen finden Sie in unserer{" "}
                    <Link 
                      to="/datenschutz" 
                      className="text-primary hover:underline font-medium"
                    >
                      Datenschutzerklärung
                    </Link>
                    .
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <Button
                    variant="outline"
                    onClick={handleDecline}
                    className="w-full sm:w-auto"
                  >
                    Ablehnen
                  </Button>
                  <Button
                    variant="hero"
                    onClick={handleAccept}
                    className="w-full sm:w-auto"
                  >
                    Akzeptieren
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Add dataLayer type to window
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
