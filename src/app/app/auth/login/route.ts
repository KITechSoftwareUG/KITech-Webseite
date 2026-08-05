import { signIn } from "@logto/next/server-actions";
import type { NextRequest } from "next/server";
import { buildCallbackUri, getLogtoConfig, sanitizeRedirectPath } from "@/lib/auth/logto";

/**
 * Verhindert, dass Next.js den Handler beim Build probeweise ausfuehrt und dabei
 * ueber die dann noch fehlenden LOGTO_-Env-Vars stolpert. Der Handler setzt
 * ohnehin Cookies, statisch waere er also nie.
 */
export const dynamic = "force-dynamic";

/** Startet den Anmelde-Flow und leitet zur LogTo Sign-In-Seite weiter. */
export async function GET(request: NextRequest) {
  const logtoConfig = getLogtoConfig();

  await signIn(logtoConfig, {
    redirectUri: buildCallbackUri(logtoConfig),
    interactionMode: "signIn",
    // Wohin es NACH dem Callback zurueckgeht. Ungepruefte Uebernahme waere ein
    // Open Redirect, deshalb durch sanitizeRedirectPath().
    postRedirectUri: sanitizeRedirectPath(request.nextUrl.searchParams.get("redirect")),
  });
}
