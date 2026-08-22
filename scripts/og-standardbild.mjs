import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Erzeugt `public/images/og/standard.png` — das Vorschaubild, das jede Seite
 * beim Teilen zeigt und das im `BlogPosting`-Schema jedes Artikels als `image`
 * steht.
 *
 * ```
 * npm run og
 * ```
 *
 * ## Warum es das gibt
 *
 * `DEFAULT_OG_IMAGE` zeigte bis zum 20.08.2026 auf
 * `storage.googleapis.com/gpt-engineer-file-uploads/…` — einen fremden Bucket
 * aus der Lovable-/gpt-engineer-Herkunft des Projekts. Die Adresse antwortete
 * zwar mit 200, aber sie gehört KITech nicht: Wer sie abschaltet, nimmt jeder
 * Seite das Teilen-Bild **und** jedem Artikel das `image` im Schema. Dazu war
 * das Bild 1024x1024 — quadratisch, also von LinkedIn, X und Facebook
 * beschnitten, die 1200x630 erwarten.
 *
 * ## Warum eine Datei und kein `opengraph-image.tsx`
 *
 * Die Dateikonvention von Next.js erzeugt eine URL mit wechselndem Hash. Das
 * Bild steht aber auch im JSON-LD, und dort braucht es eine feste Adresse.
 * Ein Vorschaubild ändert sich zudem seltener als der Code — es bei jedem Build
 * neu zu rechnen, kostet Bauzeit ohne Gegenwert. Der Selbstcheck benutzt
 * weiterhin `next/og`, weil sein Bild vom Seiteninhalt abhängt.
 *
 * Gerendert wird mit dem Chrome, der ohnehin auf der Maschine liegt, damit das
 * Bild dieselbe Wortmarke und dieselbe Schrift trägt wie die Website.
 * `puppeteer-core` ist keine Projektabhängigkeit — fehlt es, bricht das Skript
 * mit einem Hinweis ab und die vorhandene Datei bleibt liegen.
 */

const WURZEL = process.cwd();
const HIER = path.dirname(fileURLToPath(import.meta.url));
const ZIEL = path.join(WURZEL, "public", "images", "og", "standard.png");

function dataUri(datei, typ) {
  return `data:${typ};base64,${fs.readFileSync(datei).toString("base64")}`;
}

let puppeteer;
try {
  puppeteer = (await import("puppeteer-core")).default;
} catch {
  process.stderr.write(
    "puppeteer-core fehlt. Einmalig installieren:\n" +
      "  npm i -D puppeteer-core\n" +
      "Das vorhandene public/images/og/standard.png bleibt unverändert.\n"
  );
  process.exit(1);
}

const CHROME =
  process.env.CHROME_PFAD ??
  ["/opt/google/chrome/chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) =>
    fs.existsSync(p)
  );

if (!CHROME) {
  process.stderr.write("Kein Chrome gefunden. Pfad über CHROME_PFAD setzen.\n");
  process.exit(1);
}

const schriften = path.join(WURZEL, "node_modules", "@fontsource", "poppins", "files");

const html = fs
  .readFileSync(path.join(HIER, "og", "standard.html"), "utf8")
  .replace("__POPPINS_800__", dataUri(path.join(schriften, "poppins-latin-800-normal.woff2"), "font/woff2"))
  .replace("__POPPINS_500__", dataUri(path.join(schriften, "poppins-latin-500-normal.woff2"), "font/woff2"))
  .replace("__LOGO__", dataUri(path.join(WURZEL, "public", "images", "logo-weiss.webp"), "image/webp"));

const browser = await puppeteer.launch({
  headless: "new",
  executablePath: CHROME,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle0" });
await page.evaluateHandle("document.fonts.ready");
fs.mkdirSync(path.dirname(ZIEL), { recursive: true });
await page.screenshot({ path: ZIEL, type: "png" });
await browser.close();

const groesse = fs.statSync(ZIEL).size;
process.stdout.write(
  `public/images/og/standard.png  1200x630  ${(groesse / 1024).toFixed(1)} KB\n`
);
