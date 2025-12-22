"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-[450px] sm:min-h-[500px] md:min-h-[600px] flex-col items-center justify-center overflow-hidden bg-background w-full rounded-md z-0",
        className
      )}
    >
      {/* Lamp effect - hidden on mobile for cleaner look */}
      <div className="hidden sm:flex relative w-full flex-1 scale-y-100 md:scale-y-125 items-center justify-center isolate z-0">
        <motion.div
          initial={{ opacity: 0.5, width: "8rem" }}
          whileInView={{ opacity: 1, width: "12rem" }}
          viewport={{ once: true }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-32 md:h-56 overflow-visible w-[12rem] md:w-[30rem] bg-gradient-conic from-primary via-transparent to-transparent text-foreground [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute w-[100%] left-0 bg-background h-20 md:h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-20 md:w-40 h-[100%] left-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "8rem" }}
          whileInView={{ opacity: 1, width: "12rem" }}
          viewport={{ once: true }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-32 md:h-56 w-[12rem] md:w-[30rem] bg-gradient-conic from-transparent via-transparent to-primary text-foreground [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute w-20 md:w-40 h-[100%] right-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-[100%] right-0 bg-background h-20 md:h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div className="absolute top-1/2 h-24 md:h-48 w-full translate-y-6 md:translate-y-12 scale-x-150 bg-background blur-2xl"></div>
        <div className="absolute top-1/2 z-50 h-24 md:h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        <div className="absolute inset-auto z-50 h-20 md:h-36 w-[14rem] md:w-[28rem] -translate-y-1/2 rounded-full bg-primary opacity-50 blur-3xl"></div>
        <motion.div
          initial={{ width: "4rem" }}
          whileInView={{ width: "8rem" }}
          viewport={{ once: true }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-20 md:h-36 w-32 md:w-64 -translate-y-[3rem] md:-translate-y-[6rem] rounded-full bg-primary blur-2xl"
        ></motion.div>
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "12rem" }}
          viewport={{ once: true }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 w-[12rem] md:w-[30rem] -translate-y-[3.5rem] md:-translate-y-[7rem] bg-primary"
        ></motion.div>

        <div className="absolute inset-auto z-40 h-24 md:h-44 w-full -translate-y-[6rem] md:-translate-y-[12.5rem] bg-background"></div>
      </div>

      {/* Mobile: subtle glow only */}
      <div className="sm:hidden absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-3xl rounded-full"></div>

      <div className="relative z-50 flex -translate-y-0 sm:-translate-y-32 md:-translate-y-60 flex-col items-center px-5 pt-8 sm:pt-0">
        {children}
      </div>
    </div>
  );
};
