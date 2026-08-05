import { getLogtoContext } from "@logto/next/server-actions";
import { redirect } from "next/navigation";
import { DEFAULT_POST_LOGIN_PATH, getLogtoConfig, sanitizeRedirectPath } from "./logto";

/**
 * Auf das Noetigste reduzierte Sicht auf den angemeldeten Nutzer. Bewusst nicht
 * der rohe LogTo-Context: so haengt der App-Code nicht an der SDK-Form und die
 * Felder sind bereits auf einen sinnvollen Anzeigenamen normalisiert.
 */
export interface AppUser {
  /** LogTo-User-ID (`sub`), stabil — der Schluessel fuer eigene Tabellen. */
  id: string;
  email: string | null;
  name: string | null;
  username: string | null;
  /** Immer gefuellt: bester verfuegbarer Name, sonst die User-ID. */
  displayName: string;
}

/**
 * Liest die aktuelle Session. Gibt `null` zurueck, wenn niemand (mehr)
 * angemeldet ist — ohne zu redirecten, damit auch optionale Anzeige-Logik
 * (z. B. ein Avatar im Header) die Funktion nutzen kann.
 */
export async function getUser(): Promise<AppUser | null> {
  try {
    // `getAccessToken: true` ist hier der entscheidende Teil und kein Beiwerk:
    // `isAuthenticated` allein sagt nur aus, dass ueberhaupt ein Token im Cookie
    // liegt — weder Signatur noch Ablauf werden geprueft. Ein abgelaufenes oder
    // in LogTo bereits widerrufenes Konto wuerde also weiterhin als angemeldet
    // gelten. Mit getAccessToken erzwingt das SDK einen echten Refresh gegen
    // LogTo; schlaegt der fehl, ist die Session tatsaechlich tot.
    //
    // (Die Option gilt im SDK zugunsten von getAccessTokenRSC() als deprecated.
    // Wir brauchen hier aber Claims UND Token-Pruefung in einem Aufruf. Der
    // RSC-Vorbehalt gilt trotzdem: ein erneuertes Token laesst sich aus einer
    // Server Component heraus nicht ins Cookie zurueckschreiben.)
    const { isAuthenticated, claims } = await getLogtoContext(getLogtoConfig(), {
      getAccessToken: true,
    });

    if (!isAuthenticated || !claims) {
      return null;
    }

    return {
      id: claims.sub,
      email: claims.email ?? null,
      name: claims.name ?? null,
      username: claims.username ?? null,
      displayName: claims.name ?? claims.username ?? claims.email ?? claims.sub,
    };
  } catch {
    // Fail closed: fehlgeschlagener Refresh, widerrufenes Token oder ein nicht
    // erreichbarer LogTo-Server duerfen niemals als "angemeldet" durchgehen.
    return null;
  }
}

/**
 * Guard fuer geschuetzte Seiten im App-Bereich. Nicht angemeldete Besucher
 * landen auf `/auth/login` und nach der Anmeldung wieder auf `returnTo`.
 *
 * Verwendung in einer Server Component:
 *   const user = await requireUser("/einstellungen")
 *
 * `returnTo` ist der Pfad aus NUTZER-Sicht, also ohne das interne `/app`-Praefix.
 */
export async function requireUser(returnTo: string = DEFAULT_POST_LOGIN_PATH): Promise<AppUser> {
  const user = await getUser();

  if (!user) {
    // Bewusst ausserhalb des try/catch in getUser(): redirect() signalisiert
    // ueber eine geworfene Exception, ein catch wuerde sie verschlucken.
    // sanitizeRedirectPath() auch hier, damit ein Aufrufer nicht versehentlich
    // einen nutzerkontrollierten Wert in den Login-Link durchreicht.
    const target = sanitizeRedirectPath(returnTo);
    redirect(`/auth/login?redirect=${encodeURIComponent(target)}`);
  }

  return user;
}
