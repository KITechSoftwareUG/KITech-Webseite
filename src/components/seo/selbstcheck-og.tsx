import { ImageResponse } from "next/og";

/**
 * Vorschaubild des Selbstchecks beim Teilen in Messengern und sozialen Netzen.
 *
 * Eigenes Bild, weil das Standardbild aus `buildMetadata` das Firmenlogo ist —
 * auf einer markenfreien Seite waere ausgerechnet die Vorschau das Erste, was
 * die Marke zeigt. Hier steht stattdessen die Aussage des Checks.
 *
 * Die Datei wird von beiden Routen eingebunden (`/eu-ai-act-selbstcheck` und
 * dem Alias `/selbstcheck`), weil Next.js `opengraph-image` pro Routenordner
 * erwartet.
 *
 * Bewusst ohne eigene Schriftdatei: `ImageResponse` bringt eine Standardschrift
 * mit, und Onest liegt nur als woff/woff2 vor. Ein Dateizugriff auf node_modules
 * waere im `standalone`-Build von Next die Art Abhaengigkeit, die erst im
 * Container auffaellt.
 *
 * Farben stehen als Hex-Werte da: das Bild wird ausserhalb des Browsers
 * gerendert, CSS-Variablen gibt es dort nicht.
 *   #141729 = --foreground (Navy) · #6E00FF = --primary · #F5F5F5 = --surface
 */

export const OG_ALT = "EU-AI-Act-Selbstcheck: Acht Fragen. Danach wissen Sie, wo Sie stehen.";
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function selbstcheckOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              backgroundColor: "#141729",
              color: "#ffffff",
              padding: "10px 20px",
              fontSize: 24,
              letterSpacing: 2,
            }}
          >
            EU AI ACT · SELBSTCHECK
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              lineHeight: 1.2,
              color: "#141729",
              maxWidth: 940,
            }}
          >
            Acht Fragen. Danach wissen Sie, wo Sie stehen.
          </div>
          {/* Der Balken nimmt den Marker auf, mit dem auch die Seite arbeitet. */}
          <div style={{ display: "flex", width: 220, height: 10, backgroundColor: "#6E00FF", marginTop: 36 }} />
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "#4A4F63" }}>
          Zwei Minuten · keine E-Mail-Adresse · Ergebnis sofort auf der Seite
        </div>
      </div>
    ),
    OG_SIZE
  );
}
