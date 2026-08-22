# Briefing: Besucher melden ohne Cookie-Banner: was ohne Einwilligung laufen darf und was nicht

Erzeugt am 2026-08-21 aus dem Repo — ohne bezahlte Abfragen.
Thema-Kennung: `besucherbenachrichtigung-ohne-einwilligung` · Vorgeschlagener Slug: `besucher-melden-ohne-cookie-banner-was-ohne-einwilligung-laufen-darf-und-was`

---

## Die Frage, die vor allem anderen steht

> **Was steht in diesem Artikel, das nicht auf den ersten zehn Ergebnissen steht?**

Dieses Briefing kann sie nicht beantworten — es kennt die Ergebnisseite nicht.
Wer den Artikel schreibt, beantwortet sie zuerst. Fällt die Antwort dünn aus,
wird nicht geschrieben.

Googles Messlatte, wörtlich aus der eigenen Anleitung: nichts veröffentlichen,
was „could easily be produced by a generative AI model".

---

## Auftrag

| | |
|---|---|
| Zielkeyword | `tracking ohne einwilligung` |
| Thema | `ki-und-datenschutz` |
| Autor | `ayham-alkhalil` |
| Priorität | 13 |
| Notiz | Erstquelle und Verkaufsargument in einem. Die alte Ziel-Adresse des kaputten Webhooks bleibt draußen. |

---

## Der Eigenanteil

**Art:** `architekturentscheidung`

**Was:** Die Trennlinie im eigenen Betrieb: Das Ereignis selbst — Seite, Verweisquelle, Kampagne — läuft ohne Cookie, ohne Speicher im Browser und ohne IP im Webhook. Die Firmenerkennung dahinter läuft nur mit Einwilligung, nur serverseitig und nur, wenn ein Zugangstoken gesetzt ist.

**Woher:** Eigene Website: src/app/api/ereignis/route.ts, src/lib/ereignis.ts und die Inhaltsrichtlinie in next.config.ts, die seit dem Umbau keine Ziele außerhalb der eigenen Domain mehr erlaubt.

**Material, das wörtlich verwendet werden darf:**

- Vorher lief es andersherum: Zugangstoken im ausgelieferten Bundle, die Besucher-IP direkt aus dem Browser an einen Dienst außerhalb der EU — und der Empfänger antwortete seit einem Umzug mit 404, ohne dass es jemandem auffiel.
- Zählen und Klingeln sind zwei verschiedene Dinge: Statistik braucht Einwilligung, eine Benachrichtigung an den Betreiber nicht zwingend.
- Jede neue externe Verbindung muss in die Inhaltsrichtlinie eingetragen werden — sonst blockiert der Browser sie stillschweigend.

Dieser Eigenanteil muss im Artikel **sichtbar** werden — nicht als Behauptung
im Vorwort, sondern als Inhalt, den man nachvollziehen kann. Wenn er sich beim
Schreiben als dünn herausstellt, ist das ein Befund, kein Hindernis: Thema
zurücklegen, Notiz eintragen.

---

## Abgrenzung

Im Thema `ki-und-datenschutz` steht noch kein Artikel. Dieser wird der erste —
er darf also breiter anlegen, was später aufgeteilt wird.

**Bereits vergebene Zielkeywords** — keines davon darf dieser Artikel anpeilen:

`warum ki projekte scheitern` (fehler-die-fast-jedes-unternehmen-mit-ki-macht) · `ki im unternehmen hosten` (ki-im-unternehmen-aws-azure-oder-eigener-server) · `ki im unternehmen einführen` (was-ein-ki-setup-im-betrieb-wirklich-ausmacht)

---

## Interne Verlinkung

Drei bis acht Links im Fließtext. **Der Ankertext muss wörtlich in dem Absatz
stehen, auf den er gesetzt wird** — sonst wird der Link nicht gerendert und
zählt trotzdem in jeder Auswertung. Beim Umstellen der Bestandsartikel waren
das fünfzehn von fünfzehn.

Der praktische Weg: erst den Absatz schreiben, dann eine Formulierung daraus
als Ankertext eintragen.

| Ziel | eingehend | schon vergebene Ankertexte |
|---|---|---|
| `/gratis-wissen/thema/ki-und-datenschutz` | 0 | — |
| `/glossar` | 1 | „hundert Entscheidungen, zu denen nichts dasteht" |
| `/referenzen` | 2 | „Was bei jedem Handgriff gilt, steht in der Hauptdatei" · „mit einer Zahl dahinter" |
| `/leistungen` | 4 | „Eine Regel mit Anlass ist eine Erfahrung" · „Sitzt die Automatisierung nicht an diesem Vorgang" · „einen verwalteten Dienst in europäischer Region" · „Mit Regeln wird aus einem allgemeinen Werkzeug ein Bestandteil der Arbeit" |

Ziele mit wenigen eingehenden Links zuerst. Der gemessene Zusammenhang mit
Suchklicks steigt bis etwa 45 eingehende Links und kehrt sich danach um.
Formulierungen, die in der rechten Spalte stehen, **nicht wiederverwenden** —
Vielfalt der Ankertexte ist der stärkste Einzelbefund der Zyppy-Auswertung.

---

## Struktur

| | |
|---|---|
| Abschnitte | 5 bis 9 |
| Überschriften als echte Frage | mehr als die Hälfte |
| Umfang | 1.000 bis 1.800 Wörter |
| Kernaussagen | 2 bis 4, jede ohne Kontext verständlich |
| Häufige Fragen | 3 bis 5 |
| Quellen | jede Fremdzahl, mit URL und Abrufdatum |

Warum Fragen als Überschrift: In einer Auswertung von 18.012 verifizierten
ChatGPT-Zitaten stammten 78,4 Prozent der frage-verknüpften Zitate aus einer H2.
Warum die Kernaussagen oben stehen: 44,2 Prozent aller Zitate kamen aus dem
ersten Drittel des Textes.

## Hausstil, in Zahlen

| | Zielwert |
|---|---|
| Wörter je Satz | 13–17 im Mittel, kein Satz über 32 |
| Wörter je Absatz | 25–45, nie über 55 |
| Sätze je Absatz | 2 bis 3 |
| Em-Dash | mit Leerzeichen, höchstens einer je Satz, etwa jeder fünfte Satz |

**Null Vorkommen:** `du` · `wir` · `Sie` im Artikelkörper · der Firmenname ·
En-Dash im Fließtext · gerade Anführungszeichen · Semikolon · Ausrufezeichen ·
Prozentzeichen · Abkürzungen wie `z. B.` oder `bzw.` · `Tool` · `LLM` ·
`Use Case` · `Monitoring` · `könnte` · `eventuell` · `vielleicht`

Der Artikelkörper spricht **niemanden** an. Der Leser erscheint als `man`,
`jemand`, `wer`. Geduzt wird nur im CTA.

Vollständig: `scripts/blog-engine/prompts/hausstil.md`

---

## Danach

```bash
npm run blog:pruefen -- besucher-melden-ohne-cookie-banner-was-ohne-einwilligung-laufen-darf-und-was -v
npm run blog:freigeben -- besucher-melden-ohne-cookie-banner-was-ohne-einwilligung-laufen-darf-und-was --von "Ayham Alkhalil"
npm test && npm run build
```
