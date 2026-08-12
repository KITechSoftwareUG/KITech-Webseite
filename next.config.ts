import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Origin des selbst gehosteten LogTo (z. B. https://auth.kitech-software.de).
 * Wird aus `LOGTO_ENDPOINT` abgeleitet, damit die CSP nicht separat gepflegt
 * werden muss. Fehlt die Variable, bleibt die CSP unverändert — dann ist auch
 * kein Login konfiguriert.
 */
function logtoOrigin(): string | null {
  const endpoint = process.env.LOGTO_ENDPOINT;
  if (!endpoint) return null;
  try {
    return new URL(endpoint).origin;
  } catch {
    return null;
  }
}

const logto = logtoOrigin();

/**
 * Content-Security-Policy. Ausnahmen:
 *   - stats.kitech-software.de  -> selbst gehostetes Plausible
 *   - assets.calendly.com / calendly.com -> Terminbuchungs-Embed auf /lass-uns-reden
 *   - ipinfo.io                 -> Besucher-Anreicherung (visitor-enrichment.ts)
 *   - os.kitech-software.de     -> Tracking-Webhook aus visitor-enrichment.ts
 *                                  (die alte Config zeigte noch auf die frühere
 *                                  elestio-Adresse und hätte das blockiert)
 *   - LOGTO_ENDPOINT            -> Anmeldung im App-Bereich, siehe logtoOrigin()
 *
 * 'unsafe-inline' bei script-src ist nötig, weil Next.js seine Hydrations-Daten
 * per Inline-Script ausliefert. Im Dev-Modus kommt 'unsafe-eval' für Fast Refresh
 * dazu — in Produktion bleibt es draußen.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://stats.kitech-software.de https://assets.calendly.com`,
  "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
  "font-src 'self' data:",
  "img-src 'self' data: https: blob:",
  `connect-src 'self' https://stats.kitech-software.de https://os.kitech-software.de https://ipinfo.io https://calendly.com https://api.calendly.com${logto ? ` ${logto}` : ""}`,
  "frame-src https://calendly.com",
  "object-src 'none'",
  "base-uri 'self'",
  // form-action muss LogTo enthalten, sonst blockiert der Browser die Anmeldung
  // stillschweigend — ohne sichtbare Fehlermeldung.
  `form-action 'self'${logto ? ` ${logto}` : ""}`,
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * Security-Header lagen bisher in `deploy/security-headers.conf`, waren aber nie
 * aktiv: Coolify baut mit nixpacks (Caddy), das die nginx-Konfiguration gar nicht
 * liest. Hier gesetzt gelten sie unabhängig davon, womit deployt wird.
 *
 * `output: "standalone"` erzeugt einen minimalen Server-Ordner für den Container —
 * siehe Dockerfile.
 */
const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  /**
   * `/skool` und `/community` sind am 05.08.2026 entfallen — die Community wird
   * vorerst nicht auf der Website beworben (siehe CLAUDE.md, Abschnitt
   * "Entfernt"). Beide Adressen standen in der Navigation und wurden geteilt;
   * ein 404 wäre für jeden, der sie noch hat, das Ende des Wegs. Deshalb
   * Weiterleitung auf die Startseite statt ersatzlosem Wegfall.
   *
   * Spiegelbild in `src/config/navigation.ts` (`permanentRedirects`) — der
   * Routen-Test prüft beide gegeneinander.
   */
  async redirects() {
    return [
      { source: "/skool", destination: "/", permanent: true },
      { source: "/community", destination: "/", permanent: true },
      // Umbenannt am 11.08.2026 — siehe permanentRedirects in src/config/navigation.ts.
      {
        source: "/eu-ai-act-selbstcheck",
        destination: "/selbstcheck_eu_ai_act",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
