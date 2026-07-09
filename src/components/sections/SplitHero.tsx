import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import portraitAsset from "@/assets/alkhalil-portrait.png.asset.json";
import kitechLogo from "@/assets/kitech-logo.png.asset.json";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const PORTRAIT_URL = portraitAsset.url;

type Side = "solo" | "enterprise" | null;

interface PathContent {
  side: Exclude<Side, null>;
  href: string;
  eyebrow: string;
  headline: string;
  claim: string;
  hint: string;
  ariaLabel: string;
  accentClass: string;
  imageFilterClass: string;
  overlayClass: string;
}

const paths: PathContent[] = [
  {
    side: "solo",
    href: "/solo",
    eyebrow: "Für Einzelpersonen & Selbstständige",
    headline: "Ayham — Einzel-KI-Coaching mit Claude, Codex und n8n",
    claim: "Lass uns deine Art, wie du arbeitest, auf ein neues Level anheben.",
    hint: "Coaching entdecken",
    ariaLabel: "Zu Einzel-Coaching wechseln",
    accentClass: "text-solo-accent",
    imageFilterClass: "grayscale sepia-[0.15] brightness-95",
    overlayClass: "bg-gradient-to-t from-background via-background/50 to-solo-accent/10",
  },
  {
    side: "enterprise",
    href: "/enterprise",
    eyebrow: "Für Unternehmen & Organisationen",
    headline: "KI für dein Unternehmen — Enterprise AI, Private AI, Azure AI",
    claim: "Sichere, professionell implementierte KI-Automatisierung für Geschäftsprozesse mit Enterprise-Anspruch.",
    hint: "Enterprise-Lösungen entdecken",
    ariaLabel: "Zu Enterprise AI wechseln",
    accentClass: "text-enterprise-accent",
    imageFilterClass: "grayscale contrast-[1.15] brightness-90 hue-rotate-[190deg] saturate-150",
    overlayClass: "bg-gradient-to-t from-background via-background/55 to-enterprise-accent/10",
  },
];

export function SplitHero() {
  const [hovered, setHovered] = useState<Side>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-background">
      {/* Minimaler Top-Bar über der Hero-Fläche. Dezentes Scrim (bg-background/40 + Blur)
          sorgt dafür, dass Logo/Button unabhängig vom darunterliegenden Bildbereich
          lesbar und klickbar bleiben (Bild-Overlay allein ist oben zu transparent). */}
      <div className="absolute inset-x-0 top-0 z-30 flex h-16 items-center justify-between bg-background/40 px-4 backdrop-blur-sm sm:px-8">
        <Link
          to="/"
          className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="KITech Software – Startseite"
        >
          <img src={kitechLogo.url} alt="KITech Software" className="h-6 sm:h-7 w-auto drop-shadow" />
        </Link>
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Theme umschalten"
          className="rounded-full p-2 text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Vertikaler Mittelsteg mit Monogramm (nur Desktop) */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden -translate-x-1/2 md:block">
        <div className="h-full w-px bg-border/60" />
        <div className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/90 backdrop-blur-sm">
          <span className="font-display text-lg italic text-muted-foreground">o</span>
        </div>
      </div>

      <div className="flex min-h-[100dvh] flex-col md:flex-row">
        {paths.map((p) => {
          const isHovered = hovered === p.side;
          const isDimmed = hovered !== null && !isHovered;
          return (
            <Link
              key={p.side}
              to={p.href}
              onMouseEnter={() => setHovered(p.side)}
              onMouseLeave={() => setHovered(null)}
              aria-label={p.ariaLabel}
              className="group relative flex min-h-[50dvh] flex-1 items-end border-b border-border/40 outline-none last:border-b-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:min-h-[100dvh] md:border-b-0"
              style={{
                flexGrow: isHovered ? 1.12 : isDimmed ? 0.88 : 1,
                transition: "flex-grow 500ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {/* Portrait-Hintergrund, je Seite unterschiedlich getönt (eigener Clip, damit Textinhalt bei Bedarf über die Mindesthöhe hinauswachsen kann) */}
              <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                <img
                  src={PORTRAIT_URL}
                  alt=""
                  loading="eager"
                  className={`h-full w-full object-cover object-top opacity-80 transition-transform duration-700 ease-out group-hover:scale-105 ${p.imageFilterClass}`}
                  style={p.side === "enterprise" ? { transform: "scaleX(-1)" } : undefined}
                />
                <div className={`absolute inset-0 ${p.overlayClass}`} />
                <div
                  className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
                    p.side === "solo" ? "bg-solo-accent/[0.06]" : "bg-enterprise-accent/[0.06]"
                  }`}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: p.side === "solo" ? 0.15 : 0.3 }}
                className="relative z-10 w-full px-6 pb-14 sm:px-10 sm:pb-20 md:pb-24"
              >
                <span className={`mb-4 inline-block text-xs font-medium uppercase tracking-[0.2em] ${p.accentClass}`}>
                  {p.eyebrow}
                </span>
                <h2 className="mb-4 max-w-md font-display text-2xl italic leading-[1.15] text-foreground sm:text-3xl lg:text-4xl">
                  {p.headline}
                </h2>
                <p className="mb-6 max-w-sm text-sm leading-relaxed text-foreground/75 sm:text-base">
                  {p.claim}
                </p>
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
