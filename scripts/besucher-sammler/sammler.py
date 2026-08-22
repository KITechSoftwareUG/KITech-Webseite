#!/usr/bin/env python3
"""Nimmt die Meldungen der Website entgegen und schreibt sie in eine SQLite-Datei.

`/api/ereignis` in der Website meldet jedes Ereignis an `EREIGNIS_WEBHOOK_URL` —
inklusive Firma, Ort und Land, die dort serverseitig ueber ipinfo.io aufgeloest
werden. Bis zum 20.08.2026 war diese Variable nicht gesetzt: die Route
bestaetigte still mit 204 und warf alles weg. Dieser Dienst ist das fehlende
Gegenstueck.

**Warum ein eigener Dienst und nicht n8n?** n8n laeuft zwar, hat aber weder
HTTPS noch ein Konto — der Weg dorthin ist laenger als dieser hier. Und ein
Zwischenschritt, der nur weiterreicht, waere ein Teil mehr, das ausfallen kann.

**Warum nicht in der Website speichern?** Ihr Container ist fluechtig: beim
naechsten Deploy waere die Datei weg. Hier liegt sie auf dem Host.

Erreichbar ist der Dienst **nur im Docker-Netz** (`10.0.1.1`), nicht aus dem
Internet. Zusaetzlich muss jede Meldung das Geheimnis aus `SAMMLER_SECRET`
tragen.

Betrieb: systemd-Unit `kitech-ereignis-sammler.service`, siehe README.md.
"""

from __future__ import annotations

import json
import os
import signal
import sqlite3
import sys
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from zoneinfo import ZoneInfo

DATENBANK = Path(os.environ.get("SAMMLER_DB", "/home/deploy/KITech/infra/daten/besucher.sqlite3"))
ADRESSE = os.environ.get("SAMMLER_HOST", "10.0.1.1")
PORT = int(os.environ.get("SAMMLER_PORT", "8787"))
SECRET = os.environ.get("SAMMLER_SECRET", "")
ZEITZONE = ZoneInfo("Europe/Berlin")

# Wie lange die Meldungen liegen bleiben. Der Bericht schaut auf einen Tag
# zurueck, der Vergleich auf sieben — 90 Tage sind grosszuegig und trotzdem
# eine Grenze. Ohne Grenze waere es ein Archiv, das niemand beschlossen hat.
AUFBEWAHRUNG_TAGE = int(os.environ.get("SAMMLER_AUFBEWAHRUNG_TAGE", "90"))

# Groesste akzeptierte Nachricht. Die Website schickt ~400 Byte; alles darueber
# ist entweder kaputt oder ein Versuch.
MAX_KOERPER = 8 * 1024

FELDER = (
    "ereignis", "seite", "referrer", "utm_source", "utm_medium", "utm_campaign",
    "firma", "ort", "region", "land", "netz_hostname",
)


def verbindung() -> sqlite3.Connection:
    DATENBANK.parent.mkdir(parents=True, exist_ok=True)
    verb = sqlite3.connect(DATENBANK, timeout=10)
    verb.execute("PRAGMA journal_mode=WAL")  # gleichzeitiges Lesen durch den Bericht
    verb.execute(
        """
        CREATE TABLE IF NOT EXISTS ereignisse (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            zeitpunkt     TEXT NOT NULL,
            tag           TEXT NOT NULL,
            ereignis      TEXT NOT NULL,
            seite         TEXT,
            referrer      TEXT,
            utm_source    TEXT,
            utm_medium    TEXT,
            utm_campaign  TEXT,
            firma         TEXT,
            ort           TEXT,
            region        TEXT,
            land          TEXT,
            netz_hostname TEXT,
            empfangen     TEXT NOT NULL
        )
        """
    )
    verb.execute("CREATE INDEX IF NOT EXISTS ereignisse_tag ON ereignisse (tag)")
    verb.commit()
    return verb


def aufraeumen(verb: sqlite3.Connection) -> None:
    grenze = (datetime.now(ZEITZONE) - timedelta(days=AUFBEWAHRUNG_TAGE)).date().isoformat()
    verb.execute("DELETE FROM ereignisse WHERE tag < ?", (grenze,))
    verb.commit()


def berliner_tag(iso_zeit: str | None) -> tuple[str, str]:
    """Zeitpunkt der Meldung und der Kalendertag in Berliner Zeit."""
    try:
        zeit = datetime.fromisoformat((iso_zeit or "").replace("Z", "+00:00"))
        if zeit.tzinfo is None:
            zeit = zeit.replace(tzinfo=timezone.utc)
    except ValueError:
        zeit = datetime.now(timezone.utc)
    return zeit.isoformat(), zeit.astimezone(ZEITZONE).date().isoformat()


class Empfang(BaseHTTPRequestHandler):
    server_version = "KITechSammler/1.0"

    def _antwort(self, code: int) -> None:
        self.send_response(code)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802 — von BaseHTTPRequestHandler vorgegeben
        if self.path != "/gesundheit":
            self._antwort(404)
            return
        try:
            anzahl = self.server.verb.execute("SELECT count(*) FROM ereignisse").fetchone()[0]
        except sqlite3.Error:
            self._antwort(500)
            return
        rumpf = json.dumps({"status": "ok", "ereignisse": anzahl}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(rumpf)))
        self.end_headers()
        self.wfile.write(rumpf)

    def do_POST(self) -> None:  # noqa: N802
        if self.path not in ("/", "/ereignis"):
            self._antwort(404)
            return

        if SECRET and self.headers.get("x-tracking-secret") != SECRET:
            # Bewusst 404 statt 401: ein Endpunkt, dessen Existenz man nicht
            # bestaetigt, wird nicht durchprobiert.
            self._antwort(404)
            return

        try:
            laenge = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._antwort(400)
            return
        if laenge <= 0 or laenge > MAX_KOERPER:
            self._antwort(413 if laenge > MAX_KOERPER else 400)
            return

        try:
            daten = json.loads(self.rfile.read(laenge).decode("utf-8"))
            if not isinstance(daten, dict):
                raise ValueError
        except (ValueError, UnicodeDecodeError):
            self._antwort(400)
            return

        zeitpunkt, tag = berliner_tag(daten.get("zeitpunkt"))
        werte = [zeitpunkt, tag]
        werte += [
            (str(daten.get(feld))[:500] if daten.get(feld) not in (None, "") else None)
            for feld in FELDER
        ]
        werte.append(datetime.now(timezone.utc).isoformat())

        try:
            self.server.verb.execute(
                f"INSERT INTO ereignisse (zeitpunkt, tag, {', '.join(FELDER)}, empfangen) "
                f"VALUES ({', '.join('?' * (len(FELDER) + 3))})",
                werte,
            )
            self.server.verb.commit()
        except sqlite3.Error as fehler:
            print(f"SQLite: {fehler}", file=sys.stderr, flush=True)
            self._antwort(500)
            return

        self._antwort(204)

    def log_message(self, format: str, *args) -> None:  # noqa: A002 — Signatur vorgegeben
        """Kein Zugriffsprotokoll. Was hier steht, steht schon in der Datenbank,
        und ein zweites Protokoll waere ein zweiter Ort mit denselben Daten."""


def main() -> int:
    verb = verbindung()
    aufraeumen(verb)

    server = ThreadingHTTPServer((ADRESSE, PORT), Empfang)
    server.verb = verb  # type: ignore[attr-defined]

    def beenden(*_: object) -> None:
        server.shutdown()

    signal.signal(signal.SIGTERM, beenden)
    signal.signal(signal.SIGINT, beenden)

    print(f"Sammler laeuft auf {ADRESSE}:{PORT}, Datenbank {DATENBANK}", flush=True)
    try:
        server.serve_forever()
    finally:
        verb.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
