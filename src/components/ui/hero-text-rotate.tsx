"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroTextRotateProps {
  texts: string[];
  rotationInterval?: number;
  className?: string;
}

export function HeroTextRotate({
  texts,
  rotationInterval = 3000,
  className,
}: HeroTextRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval);
    return () => window.clearInterval(id);
  }, [texts.length, rotationInterval]);

  const maxText = texts.reduce((longest, text) =>
    text.length > longest.length ? text : longest
  );

  return (
    <span
      className={cn(
        "inline-block h-[1.5em] overflow-hidden relative align-bottom",
        className
      )}
      aria-live="polite"
    >
      <span className="sr-only">{texts[index]}</span>
      {/* Invisible width holder to keep the container stable */}
      <span
        className="invisible whitespace-nowrap block text-xl sm:text-3xl lg:text-5xl"
        aria-hidden="true"
      >
        {maxText}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center text-primary text-xl sm:text-3xl lg:text-5xl whitespace-nowrap"
          aria-hidden="true"
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
