import { useEffect, useState } from "react";
import { X, Calendar, ShieldCheck, Clock, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/plausible";

const CALENDLY_URL = "https://calendly.com/automatisieren-mit-kitech/30min";
const STORAGE_KEY = "exit-intent-shown-v1";

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    let armed = false;
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, 15000); // arm after 15s on site

    const trigger = () => {
      if (!armed) return;
      if (localStorage.getItem(STORAGE_KEY)) return;
      localStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
      trackEvent("CTA_Klick", { position: "exit-intent", label: "shown" });
    };

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    };

    // Mobile fallback: trigger on rapid scroll-up near top after a while
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (lastY - y > 60 && y < 200) trigger();
      lastY = y;
    };

    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!open) return null;

  const close = () => setOpen(false);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-6 sm:p-8 shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Schließen"
          className="absolute right-3 top-3 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
          <Calendar className="h-6 w-6" />
        </div>

        <h2 id="exit-intent-title" className="text-2xl font-light mb-2 text-foreground">
          Bevor Sie gehen: <span className="gradient-text">30 Min. ROI-Sparring</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Wir prüfen unverbindlich, ob KI in Ihrem Unternehmen einen messbaren
          Hebel hat – und sagen ehrlich, wenn nicht.
        </p>

        <ul className="space-y-2 text-sm text-foreground/90 mb-6">
          <li className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            Kein Verkaufsgespräch – konkrete Einschätzung
          </li>
          <li className="flex items-start gap-2">
            <Euro className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            ROI-Potenzial in Euro statt PowerPoint
          </li>
          <li className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            30 Minuten, kostenlos, DSGVO-konform
          </li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="hero"
            size="lg"
            className="flex-1"
            onClick={() => {
              trackEvent("Calendly_Klick", { position: "exit-intent" });
              window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
              close();
            }}
          >
            Termin sichern
          </Button>
          <Button variant="outline" size="lg" onClick={close}>
            Vielleicht später
          </Button>
        </div>
      </div>
    </div>
  );
}
