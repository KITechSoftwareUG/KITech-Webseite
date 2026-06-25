import { motion } from "framer-motion";
import portraitAsset from "@/assets/alkhalil-portrait.png.asset.json";

const PORTRAIT_URL = portraitAsset.url;
const NAME = "A. Alkhalil";
const ROLE = "Gründer & Geschäftsführer";
const QUOTE_SHORT = "KI wird überall reingequetscht – ohne klaren ROI. Ich mache es anders.";

/**
 * Wiederverwendbares Portrait des Gründers A. Alkhalil.
 * Varianten:
 *  - hero: großes, freigestelltes Portrait für die Startseiten-Hero
 *  - editorial: großes Editorial-Portrait für /haltung
 *  - compact: kleines Block-Portrait für /kontakt
 *  - avatar: runder Mini-Avatar für CTAs
 */
type Variant = "hero" | "editorial" | "compact" | "avatar";

interface Props {
  variant: Variant;
  className?: string;
}

export function FounderPortrait({ variant, className = "" }: Props) {
  if (variant === "avatar") {
    return (
      <img
        src={PORTRAIT_URL}
        alt={`${NAME}, ${ROLE} der KITech Software UG`}
        loading="lazy"
        className={`h-12 w-12 rounded-full object-cover object-top grayscale ring-2 ring-primary/20 ${className}`}
      />
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <img
          src={PORTRAIT_URL}
          alt={`${NAME}, ${ROLE} der KITech Software UG`}
          loading="lazy"
          className="h-16 w-16 rounded-full object-cover object-top grayscale ring-2 ring-primary/20"
        />
        <div>
          <p className="text-sm text-muted-foreground">Sie sprechen direkt mit mir.</p>
          <p className="font-light text-foreground">{NAME}</p>
          <p className="text-xs text-muted-foreground">{ROLE}</p>
        </div>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className={`relative mx-auto w-full max-w-[280px] lg:max-w-[420px] ${className}`}
      >
        {/* Soft glow behind */}
        <div className="absolute inset-x-8 bottom-0 h-2/3 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <img
          src={PORTRAIT_URL}
          alt={`${NAME}, ${ROLE} der KITech Software UG`}
          loading="eager"
          className="relative w-full h-auto object-contain grayscale transition-all duration-500 hover:grayscale-0 drop-shadow-2xl"
        />
        {/* Floating signature card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[90%] rounded-xl border border-border bg-background/95 backdrop-blur-sm p-3 sm:p-4 shadow-card"
        >
          <p className="text-[11px] sm:text-xs text-foreground/80 leading-snug italic mb-2">
            „{QUOTE_SHORT}"
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-light text-foreground">{NAME}</p>
              <p className="text-[10px] text-muted-foreground">{ROLE}</p>
            </div>
            <div className="h-px flex-1 mx-3 bg-border" />
            <span className="text-[10px] text-primary tracking-widest">KITECH</span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // editorial
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-x-12 bottom-0 h-2/3 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <img
        src={PORTRAIT_URL}
        alt={`${NAME}, ${ROLE} der KITech Software UG`}
        loading="lazy"
        className="relative w-full h-auto object-contain grayscale transition-all duration-500 hover:grayscale-0"
      />
    </div>
  );
}

export const founderInfo = {
  name: NAME,
  role: ROLE,
  quoteShort: QUOTE_SHORT,
  imageUrl: PORTRAIT_URL,
};
