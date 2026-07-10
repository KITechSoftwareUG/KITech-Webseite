import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { SignalField } from "@/components/canvas/SignalField";

type Side = "solo" | "enterprise" | null;

interface PathContent {
  side: Exclude<Side, null>;
  href: string;
  tag: string;
  headline: string;
  claim: string;
  credit: string;
  hint: string;
  ariaLabel: string;
  accentClass: string;
  accentBgClass: string;
  focusAreas: string[];
  fieldDensity: number;
  fieldIntensity: number;
  fieldAccent: string;
}

const paths: PathContent[] = [
  {
    side: "solo",
    href: "/solo",
    tag: "solo · coaching",
    headline: "Einzel-Coaching für Claude, Codex und n8n",
    claim: "Lass uns deine Art, wie du arbeitest, auf ein neues Level heben.",
    credit: "Persönlich mit Ayham Alkhalil",
    hint: "Coaching entdecken",
    ariaLabel: "Zu Einzel-Coaching wechseln",
    accentClass: "text-solo-accent",
    accentBgClass: "bg-solo-accent",
    focusAreas: ["Claude", "Codex", "n8n"],
    fieldDensity: 0.75,
    fieldIntensity: 0.9,
    fieldAccent: "--solo-accent",
  },
  {
    side: "enterprise",
    href: "/enterprise",
    tag: "enterprise · business ai",
    headline: "Enterprise AI, Private AI, Azure AI",
    claim: "Sichere, professionell implementierte KI-Automatisierung für Geschäftsprozesse – mit ROI-Garantie.",
    credit: "Für Unternehmen & Organisationen",
    hint: "Enterprise-Lösungen entdecken",
    ariaLabel: "Zu Enterprise AI wechseln",
    accentClass: "text-enterprise-accent",
    accentBgClass: "bg-enterprise-accent",
    focusAreas: ["Private AI", "Azure AI", "ROI-Garantie"],
    fieldDensity: 1.25,
    fieldIntensity: 1.1,
    fieldAccent: "--enterprise-accent",
  },
];

export function SplitHero() {
  const [hovered, setHovered] = useState<Side>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-background">
      {/* Top-Bar über der Hero-Fläche. bg-background/50 + Blur ist hier funktional (Lesbarkeit
          von Logo/Toggle über dem bewegten Signal-Field darunter), kein dekoratives Glass. */}
      <div className="absolute inset-x-0 top-0 z-30 flex h-16 items-center justify-between bg-background/50 px-4 backdrop-blur-sm sm:px-8">
        <Link
          to="/"
          className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="KITech Software – Startseite"
        >
          <img src="/logo.png" alt="KITech Software" className="h-6 sm:h-7 w-auto" />
        </Link>
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Theme umschalten"
          className="rounded-full p-2 text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Vertikaler Mittelsteg (nur Desktop): Trennlinie + Monogramm-Kreis + ein rotiertes
          Mikro-Label. Das ist der EINE bewusste Kicker dieser Hero (siehe Auftrag: maximal
          ein Kicker, kein Wiederholungsmuster) - Terminal-artig statt klassische Uppercase-
          Tracked-Eyebrow, passend zur "Kontrollraum"-Stimmung. */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden -translate-x-1/2 md:block">
        <div className="h-full w-px bg-border/60" />
        <div className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/85 backdrop-blur-sm">
          <span className="kinetic-display text-lg text-foreground">/</span>
        </div>
        <span
          className="kinetic-data absolute left-1/2 top-[calc(50%+42px)] -translate-x-1/2 whitespace-nowrap text-[10px] tracking-[0.15em] text-muted-foreground"
          style={{ writingMode: "vertical-rl" }}
        >
          select_path
        </span>
      </div>

      <div className="flex min-h-[100dvh] flex-col md:flex-row">
        {paths.map((p, i) => {
          const isHovered = hovered === p.side;
          const isDimmed = hovered !== null && !isHovered;
          return (
            <Link
              key={p.side}
              to={p.href}
              onMouseEnter={() => setHovered(p.side)}
              onMouseLeave={() => setHovered(null)}
              aria-label={p.ariaLabel}
              className="group relative flex min-h-[50dvh] flex-1 items-end border-b border-border/40 outline-none transition-[flex-grow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] last:border-b-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none md:min-h-[100dvh] md:border-b-0"
              style={{ flexGrow: isHovered ? 1.12 : isDimmed ? 0.88 : 1 }}
            >
              {/* Signal-Field trägt hier das gesamte visuelle Gewicht der Hälfte (kein Foto) -
                  jede Hälfte bekommt eine eigene Instanz mit passender Dichte/Akzentfarbe. */}
              <div
                className="absolute inset-0 opacity-90 transition-[opacity,filter] duration-500 ease-out motion-reduce:transition-none group-hover:opacity-100"
                style={{ filter: isHovered ? "brightness(1.18)" : "brightness(1)" }}
                aria-hidden="true"
              >
                <SignalField
                  density={p.fieldDensity}
                  intensity={p.fieldIntensity}
                  baseColor="--primary"
                  accentColor={p.fieldAccent}
                />
              </div>
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent`}
                aria-hidden="true"
              />

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i === 0 ? 0.15 : 0.3 }}
                className="relative z-10 w-full px-6 pb-14 sm:px-10 sm:pb-20 md:pb-24"
              >
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 backdrop-blur-sm">
                  <span className={`h-1.5 w-1.5 rounded-full ${p.accentBgClass}`} aria-hidden="true" />
                  <span className={`kinetic-data text-[11px] ${p.accentClass}`}>{p.tag}</span>
                </span>
                <h2 className="kinetic-morph-in kinetic-display mb-4 max-w-md text-3xl leading-[1.1] text-foreground [text-wrap:balance] sm:text-4xl lg:text-5xl">
                  {p.headline}
                </h2>
                <p className="mb-3 max-w-sm text-sm leading-relaxed text-foreground/80 [text-wrap:pretty] sm:text-base">
                  {p.claim}
                </p>
                <p className="mb-6 text-xs text-muted-foreground">{p.credit}</p>
                <div className="mb-7 flex flex-wrap gap-2">
                  {p.focusAreas.map((area) => (
                    <span
                      key={area}
                      className="kinetic-data rounded-full border border-border/70 px-2.5 py-1 text-[11px] text-muted-foreground"
                    >
                      {area}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground/90">
                  {p.hint}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
