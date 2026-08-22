# Briefing: CLAUDE.md richtig schreiben: Aufbau einer Datei, mit der ein Agent ein Firmenprojekt versteht

Erzeugt am 2026-08-20 aus dem Repo — ohne bezahlte Abfragen.
Thema-Kennung: `claude-md-richtig-schreiben` · Vorgeschlagener Slug: `claude-md-richtig-schreiben-aufbau-einer-datei-mit-der-ein-agent-ein`

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
| Zielkeyword | `claude.md beispiel` |
| Thema | `ki-gestuetzte-entwicklung` |
| Autor | `ayham-alkhalil` |
| Priorität | 8 |
| Notiz | Auszüge vor der Veröffentlichung von Kundennamen, Kennungen, Serveradressen und Pfaden unterhalb des Benutzerverzeichnisses befreien. Gezeigt werden die Muster, nicht die Firmeninhalte. |

---

## Der Eigenanteil

**Art:** `eigener-code`

**Was:** Die Anatomie einer gewachsenen Projektdatei statt einer leeren Vorlage: Stand-Blöcke mit Datum statt Änderungsprotokoll, eine Begründung an jeder Regel, ein Warnzeichen-Feld für offene Punkte, ein Wiederherstellungsblock mit Commit-Kennung für entfernten Code, und ein Abschnitt darüber, was ausdrücklich nicht gebaut wird.

**Woher:** Die Projektdatei dieses Repos: 892 Zeilen, gewachsen über 379 Commits, davon von 642 auf 892 Zeilen in fünf Tagen. Verlauf nachvollziehbar über git log --follow -- CLAUDE.md.

**Material, das wörtlich verwendet werden darf:**

- Regel mit Begründung: Mindesthöhe statt fester Höhe an jedem Knopf — Anlass war eine längere Beschriftung, die oben und unten aus der Fläche lief; Prüfanweisung: bei 360 Pixel Fensterbreite ansehen.
- Entfernter Code gehört dokumentiert, nicht vergessen: Commit-Kennung, der Wiederherstellungsbefehl, und die Liste dessen, was danach wieder einzutragen ist.
- Die Prüffrage für jede Zeile: Würde ein neuer Entwickler daraus dieselbe Entscheidung treffen wie ich letzten Monat?

Dieser Eigenanteil muss im Artikel **sichtbar** werden — nicht als Behauptung
im Vorwort, sondern als Inhalt, den man nachvollziehen kann. Wenn er sich beim
Schreiben als dünn herausstellt, ist das ein Befund, kein Hindernis: Thema
zurücklegen, Notiz eintragen.

---

## Abgrenzung

Im Thema `ki-gestuetzte-entwicklung` steht noch kein Artikel. Dieser wird der erste —
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
| `/glossar` | 0 | — |
| `/gratis-wissen/thema/ki-gestuetzte-entwicklung` | 0 | — |
| `/referenzen` | 1 | „mit einer Zahl dahinter" |
| `/leistungen` | 3 | „Sitzt die Automatisierung nicht an diesem Vorgang" · „einen verwalteten Dienst in europäischer Region" · „Mit Regeln wird aus einem allgemeinen Werkzeug ein Bestandteil der Arbeit" |

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
npm run blog:pruefen -- claude-md-richtig-schreiben-aufbau-einer-datei-mit-der-ein-agent-ein -v
npm run blog:freigeben -- claude-md-richtig-schreiben-aufbau-einer-datei-mit-der-ein-agent-ein --von "Ayham Alkhalil"
npm test && npm run build
```
