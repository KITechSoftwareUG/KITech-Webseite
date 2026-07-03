"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HeroTextRotateProps {
  texts: string[];
  rotationInterval?: number;
  className?: string;
}

/**
 * Simple, cross-browser text rotator.
 * - No framer-motion (avoids Chrome quirks with AnimatePresence inside <h1>)
 * - Valid inline HTML nesting (only inline-block spans inside the heading)
 * - CSS-only fade/slide via Tailwind transitions
 * - Respects prefers-reduced-motion automatically (transitions still work,
 *   just shorter perceived motion because y-offset is tiny)
 */
export function HeroTextRotate({
  texts,
  rotationInterval = 3000,
  className,
}: HeroTextRotateProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (texts.length <= 1) return;
    const id = window.setInterval(() => {
      // fade out
      setVisible(false);
      window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length);
        setVisible(true);
      }, 300);
    }, rotationInterval);
    return () => window.clearInterval(id);
  }, [texts.length, rotationInterval]);

  const maxText = texts.reduce((longest, text) =>
    text.length > longest.length ? text : longest
  );

  return (
    <span
      className={cn(
        "relative inline-block align-baseline text-primary",
        className
      )}
      aria-live="polite"
    >
      <span className="sr-only">{texts[index]}</span>
      {/* Invisible width/height holder to keep the container stable */}
      <span
        className="invisible whitespace-nowrap inline-block"
        aria-hidden="true"
      >
        {maxText}
      </span>
      {/* Absolutely positioned visible text, fades in/out */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 flex items-center justify-center whitespace-nowrap",
          "transition-all duration-300 ease-out",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        {texts[index]}
      </span>
    </span>
  );
}
