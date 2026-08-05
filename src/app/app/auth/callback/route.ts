import { handleSignIn } from "@logto/next/server-actions";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { DEFAULT_POST_LOGIN_PATH, getLogtoConfig } from "@/lib/auth/logto";

/** Siehe login/route.ts — Env-Vars erst zur Laufzeit, nicht beim Build. */
export const dynamic = "force-dynamic";

/**
 * Loest den Authorization Code gegen Tokens ein und legt die Session im
 * verschluesselten Cookie ab.
 */
export async function GET(request: NextRequest) {
  await handleSignIn(getLogtoConfig(), request.nextUrl.searchParams);

  // In der Praxis unerreichbar: /auth/login und /auth/registrieren setzen
  // postRedirectUri immer, wodurch handleSignIn() bereits selbst redirectet.
  // Bleibt als Fallback, falls postRedirectUri jemals leer ankommt.
  redirect(DEFAULT_POST_LOGIN_PATH);
}
