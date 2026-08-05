import { signIn } from "@logto/next/server-actions";
import type { NextRequest } from "next/server";
import { buildCallbackUri, getLogtoConfig, sanitizeRedirectPath } from "@/lib/auth/logto";

/** Siehe login/route.ts — Env-Vars erst zur Laufzeit, nicht beim Build. */
export const dynamic = "force-dynamic";

/**
 * Technisch derselbe OIDC-Flow wie /auth/login, nur mit `interactionMode: "signUp"`:
 * LogTo oeffnet direkt das Registrierungs-Formular statt des Login-Formulars.
 * Der Callback ist bewusst identisch — nach dem Abschluss ist beides eine Session.
 */
export async function GET(request: NextRequest) {
  const logtoConfig = getLogtoConfig();

  await signIn(logtoConfig, {
    redirectUri: buildCallbackUri(logtoConfig),
    interactionMode: "signUp",
    postRedirectUri: sanitizeRedirectPath(request.nextUrl.searchParams.get("redirect")),
  });
}
