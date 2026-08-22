#!/usr/bin/env python3
"""Taeglicher Besucherbericht der Website — holt die Zahlen und verschickt sie.

Ein Cron ruft dieses Skript einmal taeglich auf. Es fragt Plausible direkt ab
(Query-API v2) und schickt den Bericht per Microsoft Graph aus dem
M365-Postfach los.

**Warum nicht ueber `/api/tagesbericht`?** Die Route gibt es weiterhin und sie
liefert dieselben Grundzahlen an einen Webhook — aber jede Erweiterung dort
kostet einen Rebuild und ein Deploy der Live-Website. Dieser Bericht soll
wachsen duerfen, ohne die Website anzufassen. Die Route bleibt fuer den
n8n-Weg bestehen; wer beides angleichen will, findet die Abfragen hier.

Bewusst nur Python-Standardbibliothek: kein pip, keine Abhaengigkeit, die beim
naechsten Systemupdate fehlen kann. Ein Cron-Job, der wegen eines fehlenden
Pakets still ausfaellt, ist schlimmer als kein Cron-Job — dann glaubt man, es
gaebe keine Besucher.

Einrichtung, Zugangsdaten und Fehlersuche: README.md in diesem Ordner.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta
from html import escape
from pathlib import Path
from zoneinfo import ZoneInfo

STANDARD_KONFIG = Path("/home/deploy/KITech/infra/secrets/tagesbericht.env")
ZEITZONE = ZoneInfo("Europe/Berlin")
DASHBOARD = "https://stats.kitech-software.de/kitech-software.de"

WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
MONATE = [
    "Januar", "Februar", "Maerz", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
]

# Plausible liefert Laendercodes. Die haeufigsten ausgeschrieben; alles andere
# bleibt der Code — lieber ein ISO-Kuerzel als ein falscher Name.
LAENDER = {
    "DE": "Deutschland", "AT": "Oesterreich", "CH": "Schweiz", "NL": "Niederlande",
    "FR": "Frankreich", "IT": "Italien", "ES": "Spanien", "PL": "Polen",
    "GB": "Grossbritannien", "IE": "Irland", "US": "USA", "CA": "Kanada",
    "SE": "Schweden", "DK": "Daenemark", "NO": "Norwegen", "FI": "Finnland",
    "BE": "Belgien", "LU": "Luxemburg", "CZ": "Tschechien", "HU": "Ungarn",
    "PT": "Portugal", "GR": "Griechenland", "TR": "Tuerkei", "RO": "Rumaenien",
    "MT": "Malta", "IN": "Indien", "SY": "Syrien", "UA": "Ukraine",
}

# Was Plausible von sich aus zaehlt und was hier kein Klick ist: `pageview` ist
# schon als Seitenaufruf in den Kennzahlen, `engagement` erzeugt Plausible v3
# automatisch fuer Verweildauer und Scrolltiefe.
KEINE_KLICKS = {"pageview", "engagement"}


# --------------------------------------------------------------------------- #
# Konfiguration                                                                #
# --------------------------------------------------------------------------- #

def lies_konfiguration(pfad: Path) -> dict[str, str]:
    """Liest eine einfache KEY=WERT-Datei. Kommentare und Leerzeilen fliegen raus."""
    if not pfad.exists():
        raise SystemExit(
            f"Konfiguration fehlt: {pfad}\n"
            "Vorlage: scripts/tagesbericht/tagesbericht.env.example"
        )

    werte: dict[str, str] = {}
    for zeile in pfad.read_text(encoding="utf-8").splitlines():
        zeile = zeile.strip()
        if not zeile or zeile.startswith("#") or "=" not in zeile:
            continue
        schluessel, _, wert = zeile.partition("=")
        werte[schluessel.strip()] = wert.strip().strip('"').strip("'")
    return werte


# --------------------------------------------------------------------------- #
# Plausible                                                                    #
# --------------------------------------------------------------------------- #

class Plausible:
    """Duenne Huelle um die Query-API v2."""

    def __init__(self, api_url: str, site_id: str, schluessel: str) -> None:
        self.url = api_url.rstrip("/") + "/api/v2/query"
        self.site = site_id
        self.schluessel = schluessel
        self.stoerungen: list[str] = []

    def frage(
        self,
        zeitraum: list[str],
        metriken: list[str],
        dimensionen: list[str] | None = None,
        limit: int = 10,
        name: str = "",
    ) -> list[tuple[list, list]]:
        """Eine Abfrage. Bei Fehlern leere Liste — ein Abschnitt darf ausfallen,
        der Bericht nicht."""
        koerper: dict[str, object] = {
            "site_id": self.site,
            "metrics": metriken,
            "date_range": zeitraum,
        }
        if dimensionen:
            koerper["dimensions"] = dimensionen
            koerper["order_by"] = [[metriken[0], "desc"]]
            koerper["pagination"] = {"limit": limit}

        anfrage = urllib.request.Request(
            self.url,
            method="POST",
            data=json.dumps(koerper).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.schluessel}",
            },
        )

        try:
            with urllib.request.urlopen(anfrage, timeout=30) as antwort:
                daten = json.loads(antwort.read().decode("utf-8"))
            return [(z.get("dimensions", []), z.get("metrics", [])) for z in daten.get("results", [])]
        except urllib.error.HTTPError as fehler:
            rumpf = fehler.read().decode("utf-8", "replace")[:200]
            self.stoerungen.append(f"{name or dimensionen}: HTTP {fehler.code} {rumpf}")
            return []
        except Exception as fehler:  # noqa: BLE001 — im Cron zaehlt die Zeile im Log
            self.stoerungen.append(f"{name or dimensionen}: {fehler}")
            return []


# --------------------------------------------------------------------------- #
# Aufbereitung                                                                 #
# --------------------------------------------------------------------------- #

def datum_lang(tag: date) -> str:
    return f"{WOCHENTAGE[tag.weekday()]}, {tag.day}. {MONATE[tag.month - 1]} {tag.year}"


def dauer(sekunden: float | None) -> str:
    if not sekunden:
        return "0 s"
    sekunden = int(sekunden)
    if sekunden < 60:
        return f"{sekunden} s"
    return f"{sekunden // 60}:{sekunden % 60:02d} min"


def zahl(wert: float | None, nachkomma: int = 0) -> str:
    if wert is None:
        return "—"
    if nachkomma:
        return f"{wert:.{nachkomma}f}".replace(".", ",")
    return f"{int(round(wert)):,}".replace(",", ".")


def vergleich(heute: float, vorher: float | None, einheit: str = "") -> str:
    """`+3 gegenueber Vortag` — ohne Prozentakrobatik bei Einerzahlen."""
    if vorher is None:
        return ""
    unterschied = heute - vorher
    if abs(unterschied) < 0.05:
        return f"wie am Vortag ({zahl(vorher)}{einheit})"
    zeichen = "+" if unterschied > 0 else "−"
    return f"{zeichen}{zahl(abs(unterschied), 1 if isinstance(unterschied, float) and abs(unterschied) < 10 else 0)}{einheit} zum Vortag ({zahl(vorher)}{einheit})"


def ist_zahlenspalte(zeilen: list[list[str]], spalte: int) -> bool:
    """Zahlen gehoeren rechtsbuendig, Text links — sonst franst die Tabelle aus."""
    werte = [str(z[spalte]) for z in zeilen if len(z) > spalte and str(z[spalte]).strip()]
    if not werte:
        return False
    return all(w.replace(".", "").replace(",", "").replace("%", "").replace("s", "")
                .replace("min", "").replace(":", "").replace("—", "").strip().isdigit()
               or w.strip() in {"—", ""} for w in werte)


class Abschnitt:
    """Ein Block im Bericht — einmal gebaut, zweimal ausgegeben (Text und HTML)."""

    def __init__(self, titel: str, kopf: list[str], zeilen: list[list[str]], leer: str = "nichts gezaehlt") -> None:
        self.titel = titel
        self.kopf = kopf
        self.zeilen = zeilen
        self.leer = leer


def sammle(plausible: Plausible, tag: date) -> tuple[dict, list[Abschnitt]]:
    """Alles, was die API hergibt — je Abschnitt eine Abfrage."""
    heute = [tag.isoformat(), tag.isoformat()]
    vortag = [(tag - timedelta(days=1)).isoformat()] * 2
    woche = [(tag - timedelta(days=6)).isoformat(), tag.isoformat()]

    kern = ["visitors", "visits", "pageviews", "views_per_visit", "bounce_rate", "visit_duration", "events"]
    jetzt = (plausible.frage(heute, kern, name="Kennzahlen") or [([], [0] * 7)])[0][1]
    davor = (plausible.frage(vortag, kern, name="Kennzahlen Vortag") or [([], [None] * 7)])[0][1]
    sieben = (plausible.frage(woche, ["visitors", "pageviews"], name="Woche") or [([], [0, 0])])[0][1]

    kennzahlen = {
        "besucher": jetzt[0] or 0,
        "besuche": jetzt[1] or 0,
        "aufrufe": jetzt[2] or 0,
        "pro_besuch": jetzt[3] or 0,
        "absprung": jetzt[4] or 0,
        "dauer": jetzt[5] or 0,
        "ereignisse": jetzt[6] or 0,
        "vortag_besucher": davor[0],
        "vortag_aufrufe": davor[2] if davor[0] is not None else None,
        "woche_besucher": sieben[0] or 0,
        "woche_aufrufe": sieben[1] or 0,
    }

    abschnitte: list[Abschnitt] = []

    # --- Klicks: das, wonach ausdruecklich gefragt wurde ---------------------
    ereignisse = [
        (d[0], m[0])
        for d, m in plausible.frage(heute, ["events"], ["event:name"], 30, "Ereignisse")
        if d and d[0] not in KEINE_KLICKS
    ]
    ereignis_seiten: dict[str, list[tuple[str, int]]] = {}
    for d, m in plausible.frage(heute, ["events"], ["event:name", "event:page"], 100, "Ereignisse je Seite"):
        if len(d) == 2 and d[0] not in KEINE_KLICKS:
            ereignis_seiten.setdefault(d[0], []).append((d[1], m[0]))

    klick_zeilen: list[list[str]] = []
    for name, anzahl in ereignisse:
        klick_zeilen.append([name, zahl(anzahl)])
        for seite, wie_oft in sorted(ereignis_seiten.get(name, []), key=lambda x: -x[1]):
            klick_zeilen.append([f"    {seite}", zahl(wie_oft)])
    abschnitte.append(
        Abschnitt(
            "Klicks und Ereignisse",
            ["Was", "Anzahl"],
            klick_zeilen,
            "Niemand hat einen Knopf gedrueckt.",
        )
    )

    # --- Seiten --------------------------------------------------------------
    seiten = plausible.frage(heute, ["pageviews", "visitors"], ["event:page"], 20, "Seiten")
    zeit_je_seite = {d[0]: m[0] for d, m in plausible.frage(heute, ["time_on_page"], ["event:page"], 20, "Verweildauer")}
    scroll_je_seite = {d[0]: m[0] for d, m in plausible.frage(heute, ["scroll_depth"], ["event:page"], 20, "Scrolltiefe")}
    abschnitte.append(
        Abschnitt(
            "Welche Seiten",
            ["Seite", "Aufrufe", "Besucher", "Zeit", "Scroll"],
            [
                [
                    d[0],
                    zahl(m[0]),
                    zahl(m[1]),
                    dauer(zeit_je_seite.get(d[0])),
                    f"{zahl(scroll_je_seite.get(d[0]))} %" if scroll_je_seite.get(d[0]) else "—",
                ]
                for d, m in seiten
            ],
        )
    )

    # --- Wo rein, wo raus ----------------------------------------------------
    abschnitte.append(
        Abschnitt(
            "Eingestiegen ueber",
            ["Seite", "Besucher"],
            [[d[0], zahl(m[0])] for d, m in plausible.frage(heute, ["visitors"], ["visit:entry_page"], 10, "Einstieg")],
        )
    )
    abschnitte.append(
        Abschnitt(
            "Zuletzt gesehen",
            ["Seite", "Besucher"],
            [[d[0], zahl(m[0])] for d, m in plausible.frage(heute, ["visitors"], ["visit:exit_page"], 10, "Ausstieg")],
        )
    )

    # --- Woher ---------------------------------------------------------------
    abschnitte.append(
        Abschnitt(
            "Woher sie kamen",
            ["Kanal", "Besucher"],
            [[d[0], zahl(m[0])] for d, m in plausible.frage(heute, ["visitors"], ["visit:channel"], 10, "Kanal")],
        )
    )
    abschnitte.append(
        Abschnitt(
            "Quelle im Einzelnen",
            ["Quelle", "Besucher"],
            [[d[0], zahl(m[0])] for d, m in plausible.frage(heute, ["visitors"], ["visit:referrer"], 15, "Referrer")],
        )
    )

    kampagnen = [
        [f"{d[0]} / {d[1]} / {d[2]}", zahl(m[0])]
        for d, m in plausible.frage(
            heute, ["visitors"], ["visit:utm_source", "visit:utm_medium", "visit:utm_campaign"], 10, "UTM"
        )
        if d and d[0] != "(not set)"
    ]
    if kampagnen:
        abschnitte.append(Abschnitt("Kampagnen (utm)", ["Quelle / Medium / Kampagne", "Besucher"], kampagnen))

    # --- Wer und womit -------------------------------------------------------
    abschnitte.append(
        Abschnitt(
            "Aus welchem Land",
            ["Land", "Besucher"],
            [
                [LAENDER.get(d[0], d[0] or "unbekannt"), zahl(m[0])]
                for d, m in plausible.frage(heute, ["visitors"], ["visit:country"], 15, "Land")
            ],
        )
    )

    geraete = plausible.frage(heute, ["visitors"], ["visit:device"], 5, "Geraet")
    browser = plausible.frage(heute, ["visitors"], ["visit:browser"], 8, "Browser")
    system = plausible.frage(heute, ["visitors"], ["visit:os"], 8, "Betriebssystem")
    technik: list[list[str]] = []
    for titel, treffer in (("Geraet", geraete), ("Browser", browser), ("System", system)):
        for d, m in treffer:
            # "(not set)" kommt von Ereignissen ohne Sitzungsdaten — als Wort
            # ist es lesbarer als der API-Platzhalter.
            wert = d[0] if d[0] and d[0] != "(not set)" else "unbekannt"
            technik.append([titel, wert, zahl(m[0])])
    abschnitte.append(Abschnitt("Womit", ["Art", "Was", "Besucher"], technik))

    # --- Wann ----------------------------------------------------------------
    stunden = plausible.frage(heute, ["visitors", "pageviews"], ["time:hour"], 24, "Tagesverlauf")
    hoechstwert = max((m[0] for _, m in stunden), default=0)
    verlauf = []
    for d, m in sorted(stunden, key=lambda x: x[0][0]):
        if not m[0]:
            continue
        stunde = d[0][11:16] if len(d[0]) > 12 else d[0]
        balken = "█" * max(1, round((m[0] / hoechstwert) * 20)) if hoechstwert else ""
        verlauf.append([stunde, balken, zahl(m[0]), zahl(m[1])])
    abschnitte.append(Abschnitt("Wann sie da waren", ["Uhrzeit", "", "Besucher", "Aufrufe"], verlauf))

    # --- Welche Domain -------------------------------------------------------
    domains = plausible.frage(heute, ["visitors", "pageviews"], ["event:hostname"], 10, "Domain")
    if len(domains) > 1:
        abschnitte.append(
            Abschnitt(
                "Welche Adresse",
                ["Domain", "Besucher", "Aufrufe"],
                [[d[0], zahl(m[0]), zahl(m[1])] for d, m in domains],
            )
        )

    return kennzahlen, abschnitte


# --------------------------------------------------------------------------- #
# Ausgabe                                                                      #
# --------------------------------------------------------------------------- #

FUSSNOTE = (
    "Gezaehlt wird nur, wer im Cookie-Banner zugestimmt hat — die echten Zahlen "
    "liegen darueber. Einzelne Personen oder Firmen kann Plausible nicht zeigen: "
    "es speichert keine Besucherprofile."
)


def als_text(tag: date, kennzahlen: dict, abschnitte: list[Abschnitt], stoerungen: list[str]) -> str:
    z: list[str] = [f"KITech-Website — {datum_lang(tag)}", ""]

    z.append(f"  Besucher        {zahl(kennzahlen['besucher']):>7}   {vergleich(kennzahlen['besucher'], kennzahlen['vortag_besucher'])}")
    z.append(f"  Besuche         {zahl(kennzahlen['besuche']):>7}")
    z.append(f"  Seitenaufrufe   {zahl(kennzahlen['aufrufe']):>7}   {zahl(kennzahlen['pro_besuch'], 1)} pro Besuch")
    z.append(f"  Absprungrate    {zahl(kennzahlen['absprung']):>6} %")
    z.append(f"  Verweildauer    {dauer(kennzahlen['dauer']):>7}")
    z.append(f"  Ereignisse      {zahl(kennzahlen['ereignisse']):>7}")
    z.append("")
    z.append(
        f"  Letzte 7 Tage: {zahl(kennzahlen['woche_besucher'])} Besucher, "
        f"{zahl(kennzahlen['woche_aufrufe'])} Aufrufe"
    )

    for abschnitt in abschnitte:
        z.append("")
        z.append(abschnitt.titel.upper())
        if not abschnitt.zeilen:
            z.append(f"  {abschnitt.leer}")
            continue
        spalten = len(abschnitt.kopf)
        breiten = [
            max(len(str(zeile[i])) for zeile in abschnitt.zeilen + [abschnitt.kopf] if len(zeile) > i)
            for i in range(spalten)
        ]
        rechts = [ist_zahlenspalte(abschnitt.zeilen, i) for i in range(spalten)]
        for zeile in abschnitt.zeilen:
            teile = [
                str(wert).rjust(breiten[i]) if rechts[i] else str(wert).ljust(breiten[i])
                for i, wert in enumerate(zeile)
            ]
            z.append("  " + "  ".join(teile).rstrip())

    if stoerungen:
        z.append("")
        z.append("NICHT ABRUFBAR")
        for stoerung in stoerungen:
            z.append(f"  {stoerung}")

    z += ["", "—", FUSSNOTE, f"Dashboard: {DASHBOARD}"]
    return "\n".join(z)


def als_html(tag: date, kennzahlen: dict, abschnitte: list[Abschnitt], stoerungen: list[str]) -> str:
    stil_tabelle = "width:100%;border-collapse:collapse;font-size:14px;margin:0 0 28px"
    stil_kopf = "text-align:left;padding:6px 10px 6px 0;border-bottom:1px solid #ddd;color:#666;font-weight:600"
    stil_zelle = "padding:6px 10px 6px 0;border-bottom:1px solid #f0f0f0;vertical-align:top"

    t: list[str] = [
        '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111;max-width:720px">',
        f'<h1 style="font-size:20px;margin:0 0 4px">KITech-Website</h1>',
        f'<p style="margin:0 0 24px;color:#666">{escape(datum_lang(tag))}</p>',
        '<table style="' + stil_tabelle + '">',
    ]

    for label, wert, zusatz in (
        ("Besucher", zahl(kennzahlen["besucher"]), vergleich(kennzahlen["besucher"], kennzahlen["vortag_besucher"])),
        ("Besuche", zahl(kennzahlen["besuche"]), ""),
        ("Seitenaufrufe", zahl(kennzahlen["aufrufe"]), f"{zahl(kennzahlen['pro_besuch'], 1)} pro Besuch"),
        ("Absprungrate", f"{zahl(kennzahlen['absprung'])} %", ""),
        ("Verweildauer", dauer(kennzahlen["dauer"]), ""),
        ("Ereignisse", zahl(kennzahlen["ereignisse"]), ""),
        (
            "Letzte 7 Tage",
            zahl(kennzahlen["woche_besucher"]),
            f"Besucher, {zahl(kennzahlen['woche_aufrufe'])} Aufrufe",
        ),
    ):
        t.append(
            f'<tr><td style="{stil_zelle};color:#666">{escape(label)}</td>'
            f'<td style="{stil_zelle};font-size:18px;font-weight:600;text-align:right;width:90px">{escape(wert)}</td>'
            f'<td style="{stil_zelle};color:#888">{escape(zusatz)}</td></tr>'
        )
    t.append("</table>")

    for abschnitt in abschnitte:
        t.append(f'<h2 style="font-size:15px;margin:0 0 8px">{escape(abschnitt.titel)}</h2>')
        if not abschnitt.zeilen:
            t.append(f'<p style="margin:0 0 28px;color:#888;font-size:14px">{escape(abschnitt.leer)}</p>')
            continue
        rechts = [ist_zahlenspalte(abschnitt.zeilen, i) for i in range(len(abschnitt.kopf))]
        t.append(f'<table style="{stil_tabelle}"><tr>')
        for i, spalte in enumerate(abschnitt.kopf):
            rand = "text-align:right" if rechts[i] else ""
            t.append(f'<th style="{stil_kopf};{rand}">{escape(spalte)}</th>')
        t.append("</tr>")
        for zeile in abschnitt.zeilen:
            t.append("<tr>")
            for i, wert in enumerate(zeile):
                text = str(wert)
                einzug = ""
                if i == 0 and text.startswith("    "):
                    einzug = "padding-left:24px;color:#666"
                    text = text.strip()
                rand = "text-align:right;white-space:nowrap" if rechts[i] else ""
                t.append(f'<td style="{stil_zelle};{rand};{einzug}">{escape(text)}</td>')
            t.append("</tr>")
        t.append("</table>")

    if stoerungen:
        t.append('<h2 style="font-size:15px;margin:0 0 8px;color:#a33">Nicht abrufbar</h2><ul style="font-size:13px;color:#a33">')
        for stoerung in stoerungen:
            t.append(f"<li>{escape(stoerung)}</li>")
        t.append("</ul>")

    t.append(
        f'<p style="font-size:12px;color:#888;border-top:1px solid #eee;padding-top:12px">{escape(FUSSNOTE)}<br>'
        f'<a href="{DASHBOARD}" style="color:#4a4ae0">Dashboard oeffnen</a></p></div>'
    )
    return "".join(t)


# --------------------------------------------------------------------------- #
# Versand ueber Microsoft Graph                                                #
# --------------------------------------------------------------------------- #

def graph_token(konfig: dict[str, str]) -> str:
    """Client-Credentials-Flow. Setzt die App-Rolle `Mail.Send` voraus."""
    daten = urllib.parse.urlencode(
        {
            "client_id": konfig["AZURE_CLIENT_ID"],
            "client_secret": konfig["AZURE_CLIENT_SECRET"],
            "scope": "https://graph.microsoft.com/.default",
            "grant_type": "client_credentials",
        }
    ).encode()

    anfrage = urllib.request.Request(
        f"https://login.microsoftonline.com/{konfig['AZURE_TENANT_ID']}/oauth2/v2.0/token",
        method="POST",
        data=daten,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    try:
        with urllib.request.urlopen(anfrage, timeout=30) as antwort:
            return json.loads(antwort.read().decode("utf-8"))["access_token"]
    except urllib.error.HTTPError as fehler:
        rumpf = fehler.read().decode("utf-8", "replace")[:300]
        raise RuntimeError(f"Azure gibt kein Token ({fehler.code}): {rumpf}") from fehler


def sende_mail(konfig: dict[str, str], betreff: str, text: str, html: str) -> None:
    token = graph_token(konfig)
    absender = konfig["MAIL_VON"]
    empfaenger = [a.strip() for a in konfig["MAIL_AN"].split(",") if a.strip()]

    nachricht = {
        "message": {
            "subject": betreff,
            "body": {"contentType": "HTML", "content": html},
            "toRecipients": [{"emailAddress": {"address": a}} for a in empfaenger],
        },
        "saveToSentItems": False,
    }

    anfrage = urllib.request.Request(
        f"https://graph.microsoft.com/v1.0/users/{urllib.parse.quote(absender)}/sendMail",
        method="POST",
        data=json.dumps(nachricht).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
    )
    try:
        with urllib.request.urlopen(anfrage, timeout=45) as antwort:
            if antwort.status not in (200, 202):
                raise RuntimeError(f"Graph antwortet mit {antwort.status}")
    except urllib.error.HTTPError as fehler:
        rumpf = fehler.read().decode("utf-8", "replace")[:300]
        raise RuntimeError(f"Graph nimmt die Mail nicht an ({fehler.code}): {rumpf}") from fehler


# --------------------------------------------------------------------------- #

def main() -> int:
    parser = argparse.ArgumentParser(description="Taeglicher Besucherbericht der Website.")
    parser.add_argument(
        "--konfig",
        type=Path,
        default=Path(os.environ.get("TAGESBERICHT_ENV", STANDARD_KONFIG)),
        help=f"Pfad zur Konfigurationsdatei (Standard: {STANDARD_KONFIG})",
    )
    parser.add_argument("--tag", help="Berichtstag YYYY-MM-DD (Standard: gestern).")
    parser.add_argument("--trocken", action="store_true", help="Nur ausgeben, keine Mail verschicken.")
    parser.add_argument("--html", action="store_true", help="Mit --trocken die HTML-Fassung ausgeben.")
    argumente = parser.parse_args()

    konfig = lies_konfiguration(argumente.konfig)
    pflicht = ["PLAUSIBLE_API_KEY", "AZURE_TENANT_ID", "AZURE_CLIENT_ID", "AZURE_CLIENT_SECRET", "MAIL_VON", "MAIL_AN"]
    fehlend = [s for s in pflicht if not konfig.get(s)]
    if fehlend and not argumente.trocken:
        raise SystemExit(f"In {argumente.konfig} fehlen: {', '.join(fehlend)}")

    # Ohne Angabe: gestern, gerechnet in Berliner Zeit. Der Server laeuft auf
    # UTC — um 8:00 Berliner Zeit waere `date.today()` sonst noch der Vortag.
    tag = date.fromisoformat(argumente.tag) if argumente.tag else datetime.now(ZEITZONE).date() - timedelta(days=1)

    plausible = Plausible(
        konfig.get("PLAUSIBLE_API_URL", "https://stats.kitech-software.de"),
        konfig.get("PLAUSIBLE_SITE_ID", "kitech-software.de"),
        konfig.get("PLAUSIBLE_API_KEY", ""),
    )
    kennzahlen, abschnitte = sammle(plausible, tag)

    # Alles gestoert heisst: Plausible antwortet nicht. Das ist die wichtigere
    # Nachricht als ein Bericht voller Nullen — ein Ausfall der Messung darf
    # nicht aussehen wie ein Tag ohne Besucher.
    total_aus = len(plausible.stoerungen) >= 5 and not kennzahlen["besucher"] and not kennzahlen["aufrufe"]

    if total_aus:
        betreff = "KITech-Website: Bericht fehlgeschlagen"
        text = "Plausible antwortet nicht oder der API-Schluessel gilt nicht mehr.\n\n" + "\n".join(
            plausible.stoerungen[:8]
        )
        html = f"<p>{escape(text)}</p>".replace("\n", "<br>")
    else:
        betreff = (
            f"KITech-Website: {zahl(kennzahlen['besucher'])} Besucher, "
            f"{zahl(kennzahlen['aufrufe'])} Aufrufe am {tag.strftime('%d.%m.')}"
        )
        text = als_text(tag, kennzahlen, abschnitte, plausible.stoerungen)
        html = als_html(tag, kennzahlen, abschnitte, plausible.stoerungen)

    if argumente.trocken:
        print(betreff)
        print()
        print(html if argumente.html else text)
        return 1 if total_aus else 0

    sende_mail(konfig, betreff, text, html)
    print(f"Verschickt an {konfig['MAIL_AN']}: {betreff}")
    return 1 if total_aus else 0


if __name__ == "__main__":
    sys.exit(main())
