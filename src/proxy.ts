import { NextResponse, type NextRequest } from "next/server";

/**
 * Host-Routing: ein Repo, ein Deployment, mehrere Domains.
 *
 *   kitech-software.de       -> öffentliche Marketing-Seiten (statisch vorgerendert)
 *   app.kitech-software.de   -> eingeloggter Bereich, intern unter /app/*
 *   funnel.kitech-software.de -> LinkedIn-Landingpage, intern unter /funnel
 *   fokus.kitech-software.de  -> LinkedIn-Landingpage, intern unter /fokus
 *
 * Jede Domain wird auf ihr internes Segment umgeschrieben. Für Besucher bleibt
 * z. B. die URL `app.kitech-software.de/auth/login`, gerendert wird
 * `src/app/app/auth/login`. Ein Rewrite, kein Redirect — die Adresszeile
 * ändert sich nicht.
 *
 * `funnel`/`fokus` kamen am 11.08.2026 dazu (Konsolidierung der bis dahin
 * separat als eigene Vite-Repos/Coolify-Apps deployten Funnels `ki-beratung`/
 * `ki-workshop` — ein Repo statt drei, siehe `src/data/funnel.ts`/`fokus.ts`).
 *
 * Lokal ist jeder Bereich ohne DNS-Eintrag über den `*.localhost`-Host direkt
 * erreichbar (z. B. `http://app.localhost:8081/...`); dort greift der Rewrite
 * gar nicht erst, weil die Anfrage schon im richtigen Segment ankommt.
 *
 * In Next.js 16 heißt diese Datei `proxy.ts` (früher `middleware.ts`) und läuft
 * standardmäßig im Node-Runtime.
 *
 * WICHTIG: Hier findet bewusst KEINE Authentifizierungsprüfung statt. Der Guard
 * für `/app` sitzt in `src/lib/auth/session.ts` und wird pro Seite aufgerufen.
 * Eine Prüfung an dieser Stelle könnte nur sehen, OB ein Cookie existiert, nicht
 * ob es gültig ist — das wäre eine Scheinsicherheit, keine echte Grenze.
 */

/** Host -> internes Routen-Segment. */
const HOST_SEGMENTS = new Map<string, string>([
  ["app.kitech-software.de", "app"],
  ["app.localhost", "app"],
  ["funnel.kitech-software.de", "funnel"],
  ["funnel.localhost", "funnel"],
  ["fokus.kitech-software.de", "fokus"],
  ["fokus.localhost", "fokus"],
]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const segment = HOST_SEGMENTS.get(host);

  if (!segment) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  // Bereits im richtigen Segment (z. B. interner Aufruf) — nicht doppelt mappen.
  if (pathname === `/${segment}` || pathname.startsWith(`/${segment}/`)) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(`/${segment}${pathname}${search}`, request.url));
}

export const config = {
  /**
   * Statische Assets bleiben außen vor — der Proxy soll nicht bei jedem Icon
   * mitlaufen.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|robots.txt|sitemap.xml).*)"],
};
