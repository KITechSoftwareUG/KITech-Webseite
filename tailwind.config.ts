import type { Config } from "tailwindcss";
// Als Import statt `require()`: das Paket bringt eigene Typen mit (index.d.ts),
// und `require()` verstößt gegen die ESLint-Regel `no-require-imports`.
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      // `dt` = der Breakpoint, an dem die Referenz von der mobilen auf die
      // Desktop-Kopfzeile schaltet: gemessen bei 1024/1025 px (bis 1024
      // Hamburger und hohe Leiste, ab 1025 volle Navigation). Tailwinds `lg`
      // liegt bei 1024 und wuerde eine Pixelbreite zu frueh greifen.
      screens: {
        dt: "1025px",
      },
      // Eine Familie fuer alles: Poppins. Der Charakter kommt aus den
      // Gewichtsspruengen (400 Fliesstext / 500 Navigation / 700 Buttons /
      // 800 Ueberschriften), nicht aus einem zweiten Schriftschnitt.
      // Vorher: Onest fuer Text + Recursive Variable fuer Ueberschriften.
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
        body: ["Poppins", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "solo-accent": {
          DEFAULT: "hsl(var(--solo-accent))",
          foreground: "hsl(var(--solo-accent-foreground))",
        },
        "enterprise-accent": {
          DEFAULT: "hsl(var(--enterprise-accent))",
          foreground: "hsl(var(--enterprise-accent-foreground))",
        },
        // Grundtoene fuer Sektionen: `surface` ist das leichte Grau, mit dem sich
        // Abschnitte vom weissen Grund absetzen, `navbar` das Navy der Kopfzeile.
        surface: {
          DEFAULT: "hsl(var(--surface))",
          strong: "hsl(var(--surface-strong))",
        },
        navbar: {
          DEFAULT: "hsl(var(--navbar))",
          foreground: "hsl(var(--navbar-foreground))",
        },
      },
      maxWidth: {
        // Containerbreite der Vorlage.
        site: "1170px",
      },
      backgroundImage: {
        "gradient-conic": "conic-gradient(var(--conic-position), var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "slide-in-left": "slide-in-left 0.5s ease-out forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
