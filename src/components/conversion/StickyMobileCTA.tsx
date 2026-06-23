import { useEffect, useState } from "react";
import { Calendar, Phone } from "lucide-react";
import { trackEvent } from "@/lib/plausible";

const CALENDLY_URL = "https://calendly.com/automatisieren-mit-kitech/30min";
const PHONE = "+4915164682544";

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md shadow-elevated transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      role="region"
      aria-label="Schnellkontakt"
    >
      <div className="grid grid-cols-2 gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <a
          href={`tel:${PHONE}`}
          onClick={() => trackEvent("Telefon_Klick", { position: "sticky-mobile" })}
          className="flex items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm font-light text-foreground hover:bg-accent transition-colors"
        >
          <Phone className="h-4 w-4 text-primary" />
          Anrufen
        </a>
        <button
          onClick={() => {
            trackEvent("Calendly_Klick", { position: "sticky-mobile" });
            window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-light text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Calendar className="h-4 w-4" />
          Erstgespräch
        </button>
      </div>
    </div>
  );
}
