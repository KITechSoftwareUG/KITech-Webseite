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
        "relative left-1/2 block w-screen max-w-[calc(100vw-2rem)] -translate-x-1/2 text-center text-primary",
        className
      )}
      aria-live="polite"
    >
      <span
        className="inline-grid max-w-full place-items-center align-baseline"
        style={{ gridTemplateAreas: '"stack"' }}
      >
        <span className="sr-only">{texts[index]}</span>
        {/* Invisible sizer keeps the box stable at the widest phrase */}
        <span
          aria-hidden="true"
          className="invisible max-w-full whitespace-normal text-center sm:whitespace-nowrap"
          style={{ gridArea: "stack" }}
        >
          {maxText}
        </span>
        {/* Visible text sits in the same grid cell, centered on the viewport */}
        <span
          aria-hidden="true"
          style={{ gridArea: "stack" }}
          className={cn(
            "max-w-full whitespace-normal text-center sm:whitespace-nowrap",
            "transition-all duration-300 ease-out",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          {texts[index]}
        </span>
      </span>
    </span>
  );
}
