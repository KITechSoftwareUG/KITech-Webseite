import type { LogtoNextConfig } from "@logto/next";
import { BASE_URL } from "@/lib/metadata";

/**
 * Fundament der LogTo-Anbindung fuer den eingeloggten Bereich.
 *
 * Zur Pfad-Topologie: Die Auth-Routen liegen im Repo unter `src/app/app/auth/*`,
 * sind aber ueber den Host-Rewrite als `https://app.kitech-software.de/auth/*`
 * erreichbar. Alle Pfade in dieser Datei sind deshalb aus NUTZER-Sicht notiert,
 * also ohne `/app`-Praefix — LogTo und der Browser sehen nur die oeffentliche
 * Adresse, das interne Praefix existiert fuer sie nicht.
 */

/** Ziel nach erfolgreichem Login: die Startseite des App-Bereichs. */
export const DEFAULT_POST_LOGIN_PATH = "/";

/**
 * Ziel nach dem Logout: die oeffentliche Marketing-Startseite auf der anderen
 * Domain. Bewusst aus `metadata.ts` bezogen, damit es nur eine Quelle fuer die
 * Marketing-Basis-URL gibt.
 *
 * Achtung beim Deployment: LogTo akzeptiert als Post-Sign-Out-Redirect nur URIs,
 * die in der Admin Console hinterlegt sind — diese hier muss dort eingetragen sein.
 */
export const POST_LOGOUT_URL = BASE_URL;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Bewusst eine FUNKTION und keine Modul-Konstante: Bei einer Konstante wuerde
 * `requiredEnv()` schon beim Import des Moduls laufen, also waehrend
 * `next build` in der Phase "Collecting page data" — und der Docker-Build
 * (der keine Laufzeit-Secrets kennt) wuerde dort abbrechen. So werden die
 * Werte erst pro Request gelesen.
 */
export function getLogtoConfig(): LogtoNextConfig {
  const baseUrl = requiredEnv("LOGTO_BASE_URL");

  return {
    appId: requiredEnv("LOGTO_APP_ID"),
    appSecret: requiredEnv("LOGTO_APP_SECRET"),
    endpoint: requiredEnv("LOGTO_ENDPOINT"),
    baseUrl,
    cookieSecret: requiredEnv("LOGTO_COOKIE_SECRET"),
    // An baseUrl gekoppelt statt an NODE_ENV: Next.js inlined NODE_ENV beim
    // Build fest auf "production", der Wert waere hier also immer true — auch
    // wenn die App lokal oder ueber eine reine HTTP-Vorschau-Domain laeuft.
    // Secure-Cookies wuerde der Browser dort verwerfen, der Login liefe ins Leere.
    cookieSecure: baseUrl.startsWith("https://"),
  };
}

/**
 * Die Redirect-URI, die LogTo nach der Anmeldung aufruft. Muss identisch in der
 * LogTo Admin Console als "Redirect URI" hinterlegt sein, sonst lehnt LogTo die
 * Autorisierungsanfrage ab.
 */
export function buildCallbackUri(config: LogtoNextConfig): string {
  return `${config.baseUrl}/auth/callback`;
}

/**
 * Whitelist statt Blacklist. Eine Blacklist-Pruefung wie
 * `startsWith("/") && !startsWith("//")` laest `/\evil.com` durch: Browser
 * normalisieren den Backslash zu einem Slash, aus dem Location-Header wird
 * `//evil.com` — eine protokoll-relative URL auf eine fremde Domain, also ein
 * Open Redirect. Die Regex erlaubt daher nur genau einen fuehrenden Slash,
 * gefolgt von unbedenklichen URL-Zeichen; Backslashes kommen im Zeichensatz
 * gar nicht erst vor.
 */
const SAFE_REDIRECT_PATH = /^\/(?![/\\])[A-Za-z0-9\-._~!$&'()*+,;=:@%/?#]*$/;

/**
 * Nimmt den `redirect`-Query-Parameter entgegen und gibt ihn nur zurueck, wenn
 * er ein relativer, same-origin Pfad ist. Alles andere faellt auf `fallback`.
 */
export function sanitizeRedirectPath(
  value: string | null | undefined,
  fallback: string = DEFAULT_POST_LOGIN_PATH,
): string {
  if (!value || !SAFE_REDIRECT_PATH.test(value)) {
    return fallback;
  }

  // Zweite Verteidigungslinie: `%` ist im Zeichensatz erlaubt (deutsche Slugs
  // enthalten prozent-kodierte Umlaute), damit passieren aber auch `%2F` und
  // `%5C` die Regex und ergeben nach dem Dekodieren wieder eine fremde Origin.
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Kaputtes Encoding gar nicht erst weiterreichen.
    return fallback;
  }

  if (
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    decoded.includes("://")
  ) {
    return fallback;
  }

  return value;
}
