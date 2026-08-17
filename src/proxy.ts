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

/**
 * Segmente, die aus **einer einzigen Seite** bestehen.
 *
 * Für sie wird nur die Wurzel umgeschrieben (`funnel.kitech-software.de/` →
 * `/funnel`); jeder andere Pfad geht unverändert an die normale Website.
 *
 * **Warum das nötig ist:** Die Kampagnenseiten verlinken auf Seiten der
 * Hauptwebsite — der Anmelde-Knopf auf `/lass-uns-reden`, die Fußzeile auf
 * `/impressum`, `/datenschutz` und `/agb`. Ohne diese Unterscheidung wurden
 * daraus `/funnel/lass-uns-reden` und `/funnel/impressum`: Routen, die es nicht
 * gibt. Das war live so — der **einzige CTA der Seite lief in eine 404**, und
 * die Anbieterkennzeichnung nach § 5 DDG war von der Domain aus nicht
 * erreichbar. Der Fehler fiel nicht auf, weil auf der Hauptdomain alles
 * funktionierte und beide Seiten selbst sauber luden.
 *
 * `app` steht bewusst **nicht** in dieser Liste: der eingeloggte Bereich hat
 * echte Unterseiten (`/auth/login`, `/auth/callback` …), die alle unter
 * `app.kitech-software.de` erreichbar bleiben müssen.
 */
const EINSEITIGE_SEGMENTE = new Set(["funnel", "fokus"]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const segment = HOST_SEGMENTS.get(host);

  if (!segment) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  /*
   * API-Routen liegen global unter `/api` und gehören zu keiner Domain. Ohne
   * diese Ausnahme würde `funnel.kitech-software.de/api/funnel-besuch` auf
   * `/funnel/api/funnel-besuch` umgeschrieben — eine Route, die es nicht gibt,
   * also eine 404. Genau das ist beim ersten Deploy der Besuchsmeldung
   * passiert: über die Hauptdomain kam sie an, über die Funnel-Domain nie.
   *
   * Der eingeloggte Bereich ist davon nicht betroffen: seine Route Handler
   * liegen unter `/app/auth/*`, nicht unter `/api/*`.
   */
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  /*
   * Einseitige Segmente: nur die Wurzel gehört der Kampagnenseite, alles andere
   * ist die normale Website (Begründung bei `EINSEITIGE_SEGMENTE`).
   */
  if (EINSEITIGE_SEGMENTE.has(segment)) {
    return pathname === "/"
      ? NextResponse.rewrite(new URL(`/${segment}${search}`, request.url))
      : NextResponse.next();
  }

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
