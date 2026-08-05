import { signOut } from "@logto/next/server-actions";
import { getLogtoConfig, POST_LOGOUT_URL } from "@/lib/auth/logto";

/** Siehe login/route.ts — Env-Vars erst zur Laufzeit, nicht beim Build. */
export const dynamic = "force-dynamic";

/**
 * Bewusst POST und nicht GET: Ein GET-Logout laesst sich von einer fremden Seite
 * aus per `<img src="https://app.kitech-software.de/auth/logout">` ausloesen und
 * meldet den Nutzer ungefragt ab (Login-CSRF). Mit POST greift die
 * SameSite-Voreinstellung des Browsers, ein reiner Bild- oder Link-Aufruf laeuft
 * ins Leere.
 *
 * Fuer alle anderen Methoden — insbesondere GET — antwortet Next.js
 * automatisch mit 405, genau das ist hier erwuenscht. Aufrufer brauchen deshalb
 * ein echtes <form method="post"> bzw. einen fetch("POST").
 */
export async function POST() {
  const logtoConfig = getLogtoConfig();

  // Loescht das Session-Cookie und schickt den Nutzer ueber den LogTo-Endpunkt
  // (damit auch die LogTo-Session endet) zurueck auf die Marketing-Startseite.
  await signOut(logtoConfig, POST_LOGOUT_URL);
}
