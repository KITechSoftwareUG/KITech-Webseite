"use client";

import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";

const PORTRAIT_URL = "/images/team/ayham.webp";
const NAME = "Ayham Alkhalil";
const ROLE = "Gründer & Geschäftsführer";
const QUOTE_SHORT = "KI wird überall reingequetscht – ohne klaren ROI. Ich mache es anders.";
const LINKEDIN_URL = "https://www.linkedin.com/in/ayham-alkhalil-66bb451b5";

/**
 * Wiederverwendbares Portrait des Gründers A. Alkhalil.
 * Varianten:
 *  - hero: großes, freigestelltes Portrait für die Startseiten-Hero
 *  - editorial: großes Editorial-Portrait für /haltung
 *  - compact: kleines Block-Portrait für /kontakt
 *  - avatar: runder Mini-Avatar für CTAs
 *
 * Helles Design (11.08.2026): Der dunkelblaue Ring am Avatar und der weiche Schein
 * hinter den großen Portraits bleiben — beides ist auf Weiß dezent genug, um die
 * freigestellte Figur zu tragen, ohne als zweite Farbfläche zu wirken. Die
 * Zitatkarte im Hero ist eine echte Karte geworden (weiß, gerundet, Ring statt
 * Rahmen), weil sie über dem Bild schwebt und dafür Kante und Schatten braucht.
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
          <p className="text-sm font-normal text-muted-foreground">Sie sprechen direkt mit mir.</p>
          {/* Der Name ist die Auszeichnung dieses Blocks — auf hellem Grund traegt
              ihn nur ein schwerer Schnitt, der frueher hier stehende `font-light`
              verschwindet. */}
          <p className="font-semibold text-foreground">{NAME}</p>
          <p className="text-xs font-normal text-muted-foreground">{ROLE}</p>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
            LinkedIn-Profil
          </a>
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
        className={`relative mx-auto w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[560px] xl:max-w-[620px] ${className}`}
      >
        {/* Weicher Schein hinter der Figur: gibt dem freigestellten Portrait auf
            weissem Grund einen Standpunkt, statt es schweben zu lassen. */}
        <div className="absolute inset-x-8 bottom-0 h-2/3 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <img
          src={PORTRAIT_URL}
          alt={`${NAME}, ${ROLE} der KITech Software UG`}
          loading="eager"
          className="relative w-full h-auto object-contain grayscale transition-all duration-500 hover:grayscale-0 drop-shadow-2xl"
        />
        {/* Zitatkarte, die ueber dem unteren Bildrand liegt. Als Karte im neuen
            Stil (weiss, gerundet, Ring, kraeftiger Schatten): sie steht auf dem
            Bild, nicht auf dem Seitengrund, und braucht deshalb Hoehe. Der
            frueher noetige Blur entfaellt — hinter ihr liegt kein bewegter Grund
            mehr, der durchscheinen muesste. */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[90%] rounded-lg bg-white border border-border p-3 sm:p-4"
        >
          <p className="text-mini sm:text-xs font-normal text-muted-foreground leading-snug italic mb-2">
            „{QUOTE_SHORT}"
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">{NAME}</p>
              <p className="text-mini font-normal text-muted-foreground">{ROLE}</p>
            </div>
            <div className="h-px flex-1 mx-3 bg-border" />
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn-Profil von Ayham Alkhalil"
              className="mr-2.5 text-primary transition-opacity hover:opacity-80"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <span className="text-mini font-bold text-primary tracking-widest">KITECH</span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // editorial
  return (
    <div className={`relative ${className}`}>
      {/* Derselbe weiche Schein wie in der Hero-Variante — siehe dort. */}
      <div className="absolute inset-x-12 bottom-0 h-2/3 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <img
        src={PORTRAIT_URL}
        alt={`${NAME}, ${ROLE} der KITech Software UG`}
        loading="lazy"
        className="relative w-full h-auto object-contain grayscale transition-all duration-500 hover:grayscale-0"
      />
      <a
        href={LINKEDIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <Linkedin className="h-4 w-4" aria-hidden="true" />
        {NAME} auf LinkedIn
      </a>
    </div>
  );
}

export const founderInfo = {
  name: NAME,
  role: ROLE,
  quoteShort: QUOTE_SHORT,
  imageUrl: PORTRAIT_URL,
  linkedinUrl: LINKEDIN_URL,
};
