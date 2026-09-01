/**
 * Zugangstoken für Google-APIs über ein **Dienstkonto** (Service Account).
 *
 * **Warum kein `google-auth-library`.** Gebraucht wird genau ein Vorgang: aus
 * einem privaten Schlüssel ein kurzlebiges Zugangstoken machen. Das ist ein
 * offener Standard (RFC 7523, „JWT Bearer Grant") und steht unten in rund
 * vierzig Zeilen. Das offizielle Paket bringt dafür den halben API-Baum mit und
 * landete in derselben `package.json`, die Next beim Build liest — für einen
 * Aufruf, den Node mit Bordmitteln signieren kann.
 *
 * **Warum ein Dienstkonto und nicht OAuth.** Der OAuth-Weg für Desktop-Apps
 * verlangt einen Browser-Login und liefert ein Refresh-Token, das Google bei
 * Apps im Status „Test" **nach sieben Tagen verfallen lässt**. Eine Automatik,
 * die wöchentlich einen Menschen zum Neuanmelden braucht, ist keine. Das
 * Dienstkonto hat keinen Ablauf und keinen Menschen im Weg.
 *
 * ⚠️ **Die Uhr des Servers ist Teil der Authentifizierung.** Das signierte JWT
 * trägt `iat`/`exp`; geht die Systemuhr um mehr als wenige Minuten falsch,
 * antwortet Google mit `invalid_grant` — einem Fehler, der nach einem falschen
 * Schlüssel klingt und keiner ist. Wer diesen Fehler sieht und den Schlüssel
 * neu erzeugt, sucht an der falschen Stelle: zuerst `timedatectl` lesen.
 *
 * ⚠️ **Der private Schlüssel ist ein echtes Geheimnis** — anders als die
 * Bestätigungskennungen in `src/config/suchkonsolen.ts`, die im Quelltext jeder
 * Seite stehen. Wer diese Datei hat, spricht als das Dienstkonto. Sie gehört
 * nicht ins Repo, sondern nach `/home/deploy/KITech/infra/secrets/` mit
 * `chmod 600`; `.env` trägt nur den Pfad dorthin.
 */

import fs from "node:fs";
import crypto from "node:crypto";

/** Googles Endpunkt für den Tausch JWT → Zugangstoken. */
const TOKEN_ENDPUNKT = "https://oauth2.googleapis.com/token";

/** Der Grant-Typ aus RFC 7523. Kein Tippfehler, die URN ist wörtlich so. */
const GRANT_TYPE = "urn:ietf:params:oauth:grant-type:jwt-bearer";

/**
 * Gültigkeit des selbst signierten JWT. Google erlaubt maximal eine Stunde und
 * lehnt längere Angaben ab — das Zugangstoken, das dabei herauskommt, lebt
 * ebenfalls eine Stunde.
 */
const JWT_LAUFZEIT_SEKUNDEN = 3600;

/**
 * Sicherheitsabstand beim Wiederverwenden eines Tokens. Ein Token, das in
 * dreißig Sekunden abläuft, überlebt eine langsame Anfrage nicht.
 */
const VORLAUF_SEKUNDEN = 60;

export class GoogleAuthFehler extends Error {
  constructor(nachricht: string, public readonly ursache?: unknown) {
    super(nachricht);
    this.name = "GoogleAuthFehler";
  }
}

/** Die Felder des Dienstkonto-JSON, die hier gebraucht werden. */
interface Dienstkonto {
  client_email: string;
  private_key: string;
  project_id?: string;
  type?: string;
}

/**
 * Liest das Dienstkonto aus `GOOGLE_SERVICE_ACCOUNT_JSON`.
 *
 * Die Variable darf zweierlei enthalten, weil die beiden Laufumgebungen
 * verschieden ticken: auf dem Server einen **Pfad** zur Schlüsseldatei, in
 * Coolify das **JSON selbst** (dort gibt es kein Dateisystem für Geheimnisse).
 * Unterschieden wird am ersten Zeichen — JSON beginnt mit `{`.
 */
function ladeDienstkonto(): Dienstkonto {
  const wert = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();

  if (!wert) {
    throw new GoogleAuthFehler(
      "GOOGLE_SERVICE_ACCOUNT_JSON fehlt. Erwartet wird der Pfad zur " +
        "Schlüsseldatei des Dienstkontos (oder das JSON selbst). " +
        "Einrichtung: deploy/SUCHKONSOLEN.md, Abschnitt „Zugang für die API“."
    );
  }

  let roh: string;
  if (wert.startsWith("{")) {
    roh = wert;
  } else {
    if (!fs.existsSync(wert)) {
      throw new GoogleAuthFehler(
        `Die Schlüsseldatei ${wert} gibt es nicht. GOOGLE_SERVICE_ACCOUNT_JSON ` +
          "zeigt ins Leere — Pfad prüfen (er muss absolut sein, der Cron startet " +
          "in einem anderen Verzeichnis)."
      );
    }
    roh = fs.readFileSync(wert, "utf8");
  }

  let konto: Dienstkonto;
  try {
    konto = JSON.parse(roh) as Dienstkonto;
  } catch (ursache) {
    throw new GoogleAuthFehler(
      "Die Schlüsseldatei ist kein gültiges JSON. Heruntergeladen wird sie in " +
        "der Google Cloud Console unter Dienstkonten → Schlüssel → JSON.",
      ursache
    );
  }

  if (!konto.client_email || !konto.private_key) {
    throw new GoogleAuthFehler(
      "Der Schlüsseldatei fehlen `client_email` oder `private_key`. Das ist " +
        "vermutlich eine OAuth-Client-Datei statt eines Dienstkonto-Schlüssels: " +
        "Ein Dienstkonto-JSON trägt `\"type\": \"service_account\"`."
    );
  }

  /*
   * Kommt der Schlüssel über eine Umgebungsvariable statt aus einer Datei,
   * stehen die Zeilenumbrüche des PEM-Blocks dort als die zwei Zeichen `\n`.
   * Ohne diese Rückübersetzung schlägt das Signieren mit einer Meldung fehl,
   * die nach einem kaputten Schlüssel klingt.
   */
  konto.private_key = konto.private_key.replace(/\\n/g, "\n");

  return konto;
}

/** base64url nach RFC 7515: URL-sicheres Alphabet, kein `=`-Padding. */
function base64url(eingabe: string | Buffer): string {
  return Buffer.from(eingabe)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Ein Zugangstoken je Scope-Kombination, solange der Prozess läuft. Ein Lauf
 * mit zwanzig Abfragen soll nicht zwanzigmal ein Token holen.
 */
const zwischenspeicher = new Map<string, { token: string; laeuftAbUm: number }>();

/**
 * Die gerade laufenden Tokenanfragen.
 *
 * **Warum das nötig ist.** Der Zwischenspeicher oben greift erst, wenn eine
 * Antwort da ist. Zwei parallel gestartete Abfragen — etwa die Gesamtsumme und
 * die Zeilen darunter — finden ihn beide leer und holen beide ein Token. Hier
 * wartet die zweite stattdessen auf die erste.
 */
const unterwegs = new Map<string, Promise<string>>();

/**
 * Besorgt ein Zugangstoken für die angegebenen Scopes.
 *
 * Der Ablauf: JWT bauen → mit dem privaten Schlüssel signieren → bei Google
 * gegen ein Zugangstoken tauschen. Innerhalb eines Prozesses wird das Ergebnis
 * bis kurz vor Ablauf wiederverwendet.
 */
export async function zugangstoken(scopes: string[]): Promise<string> {
  const schluesselNamen = [...scopes].sort().join(" ");
  const jetzt = Math.floor(Date.now() / 1000);

  const gemerkt = zwischenspeicher.get(schluesselNamen);
  if (gemerkt && gemerkt.laeuftAbUm - VORLAUF_SEKUNDEN > jetzt) {
    return gemerkt.token;
  }

  const laufend = unterwegs.get(schluesselNamen);
  if (laufend) return laufend;

  const anfrage = holeToken(schluesselNamen, jetzt).finally(() => {
    unterwegs.delete(schluesselNamen);
  });
  unterwegs.set(schluesselNamen, anfrage);
  return anfrage;
}

async function holeToken(schluesselNamen: string, jetzt: number): Promise<string> {
  const konto = ladeDienstkonto();

  const kopf = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const rumpf = base64url(
    JSON.stringify({
      iss: konto.client_email,
      scope: schluesselNamen,
      aud: TOKEN_ENDPUNKT,
      iat: jetzt,
      exp: jetzt + JWT_LAUFZEIT_SEKUNDEN,
    })
  );

  let signatur: string;
  try {
    signatur = base64url(
      crypto.createSign("RSA-SHA256").update(`${kopf}.${rumpf}`).sign(konto.private_key)
    );
  } catch (ursache) {
    throw new GoogleAuthFehler(
      "Das JWT ließ sich nicht signieren — der private Schlüssel ist unbrauchbar. " +
        "Er muss ein PEM-Block sein, der mit `-----BEGIN PRIVATE KEY-----` beginnt.",
      ursache
    );
  }

  const antwort = await fetch(TOKEN_ENDPUNKT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: GRANT_TYPE,
      assertion: `${kopf}.${rumpf}.${signatur}`,
    }),
  });

  const text = await antwort.text();

  if (!antwort.ok) {
    /*
     * `invalid_grant` ist der Fehler, der am häufigsten falsch gedeutet wird:
     * Er heißt fast nie „falscher Schlüssel", sondern „die Uhr geht falsch"
     * oder „das Dienstkonto wurde gelöscht".
     */
    const hinweis = text.includes("invalid_grant")
      ? "\n\nHinweis: `invalid_grant` deutet zuerst auf eine falsch gehende " +
        "Systemuhr hin (`timedatectl` prüfen), erst danach auf einen " +
        "gelöschten oder gesperrten Schlüssel."
      : "";
    throw new GoogleAuthFehler(
      `Google lehnte den Tokentausch ab (HTTP ${antwort.status}): ${text}${hinweis}`
    );
  }

  const daten = JSON.parse(text) as { access_token?: string; expires_in?: number };
  if (!daten.access_token) {
    throw new GoogleAuthFehler(`Antwort ohne access_token: ${text}`);
  }

  zwischenspeicher.set(schluesselNamen, {
    token: daten.access_token,
    laeuftAbUm: jetzt + (daten.expires_in ?? JWT_LAUFZEIT_SEKUNDEN),
  });

  return daten.access_token;
}

/** Die E-Mail-Adresse des Dienstkontos — die, die in der Search Console als Nutzer stehen muss. */
export function dienstkontoAdresse(): string {
  return ladeDienstkonto().client_email;
}
