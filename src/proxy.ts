import { NextResponse, type NextRequest } from "next/server";

/**
 * Host-Routing: ein Repo, ein Deployment, zwei Domains.
 *
 *   kitech-software.de       -> öffentliche Marketing-Seiten (statisch vorgerendert)
 *   app.kitech-software.de   -> eingeloggter Bereich, intern unter /app/*
 *
 * Die App-Domain wird auf das interne Segment `/app` umgeschrieben. Für Besucher
 * bleibt die URL `app.kitech-software.de/auth/login`, gerendert wird
 * `src/app/app/auth/login`. Ein Rewrite, kein Redirect — die Adresszeile ändert
 * sich nicht.
 *
 * Lokal ist der Bereich ohne DNS-Eintrag unter `http://localhost:8081/app/...`
 * direkt erreichbar; dort greift der Rewrite gar nicht erst.
 *
 * In Next.js 16 heißt diese Datei `proxy.ts` (früher `middleware.ts`) und läuft
 * standardmäßig im Node-Runtime.
 *
 * WICHTIG: Hier findet bewusst KEINE Authentifizierungsprüfung statt. Der Guard
 * sitzt in `src/lib/auth/session.ts` und wird pro Seite aufgerufen. Eine Prüfung
 * an dieser Stelle könnte nur sehen, OB ein Cookie existiert, nicht ob es gültig
 * ist — das wäre eine Scheinsicherheit, keine echte Grenze.
 */

/** Hosts, die den eingeloggten Bereich ausliefern. */
const APP_HOSTS = new Set(["app.kitech-software.de", "app.localhost"]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";

  if (!APP_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  // Bereits im /app-Segment (z. B. interner Aufruf) — nicht doppelt mappen.
  if (pathname === "/app" || pathname.startsWith("/app/")) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(`/app${pathname}${search}`, request.url));
}

export const config = {
  /**
   * Statische Assets bleiben außen vor — der Proxy soll nicht bei jedem Icon
   * mitlaufen.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|robots.txt|sitemap.xml).*)"],
};
