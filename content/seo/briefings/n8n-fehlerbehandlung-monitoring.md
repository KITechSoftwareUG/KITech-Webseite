# Briefing: Was passiert, wenn eine Automatisierung nachts abstürzt? Fehlerbehandlung und Alarmierung

Erzeugt am 2026-08-24 aus dem Repo — ohne bezahlte Abfragen.
Thema-Kennung: `n8n-fehlerbehandlung-monitoring` · Vorgeschlagener Slug: `was-passiert-wenn-eine-automatisierung-nachts-abstuerzt-fehlerbehandlung-und`

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
| Zielkeyword | `n8n fehlerbehandlung monitoring` |
| Thema | `prozessautomatisierung` |
| Autor | `ayham-alkhalil` |
| Priorität | 11 |
| Notiz | Rückt an die Stelle des ursprünglich elftplatzierten Themas „Warum KI-Projekte scheitern“ — dessen Zielkeyword ist bereits durch einen bestehenden Artikel belegt. |

---

## Der Eigenanteil

**Art:** `eigener-code`

**Was:** Die vier Pflichtteile jedes Workflows — Fehlerzweig, Protokollierung, Wiederholung mit Wartezeit und höchstens drei Versuchen, versionierter Export im Repo — und die Sperre gegen Dauerfeuer: eine Ablage je Zweck mit Zehn-Minuten-Fenster, samt dem Kommentar, der ihre eigene Grenze benennt.

**Woher:** src/lib/melde-sperre.ts in diesem Repo, der Workflow-Export unter deploy/n8n-benachrichtigung.json und die eigene Automatisierungsregel für n8n-Workflows.

**Material, das wörtlich verwendet werden darf:**

- Bei mehreren Instanzen müsste der Zähler nach außen wandern — die Sperre ist bewusst eine Ablage im Prozess und sagt das im Code selbst.
- Knoten heißen „Filter: Leads ohne Email“, nicht „IF1“. Wer nachts um drei einen Alarm liest, braucht einen Namen, keine Nummer.

Dieser Eigenanteil muss im Artikel **sichtbar** werden — nicht als Behauptung
im Vorwort, sondern als Inhalt, den man nachvollziehen kann. Wenn er sich beim
Schreiben als dünn herausstellt, ist das ein Befund, kein Hindernis: Thema
zurücklegen, Notiz eintragen.

---

## Abgrenzung

Im Thema `prozessautomatisierung` steht noch kein Artikel. Dieser wird der erste —
er darf also breiter anlegen, was später aufgeteilt wird.

**Bereits vergebene Zielkeywords** — keines davon darf dieser Artikel anpeilen:

`tracking ohne einwilligung` (besucher-melden-ohne-cookie-banner) · `claude.md beispiel` (claude-md-die-nach-sechs-monaten-noch-stimmt) · `e-rechnung pflicht 2027` (e-rechnung-ab-1-1-2027-wer-versenden-muss-und-was-bis-dahin-zu-tun-ist) · `warum ki projekte scheitern` (fehler-die-fast-jedes-unternehmen-mit-ki-macht) · `ki im unternehmen hosten` (ki-im-unternehmen-aws-azure-oder-eigener-server) · `ki im unternehmen einführen` (was-ein-ki-setup-im-betrieb-wirklich-ausmacht)

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
| `/gratis-wissen/thema/prozessautomatisierung` | 0 | — |
| `/glossar` | 3 | „Der Unterschied klingt technisch" · „hundert Entscheidungen, zu denen nichts dasteht" · „findet sie erklärt statt vorausgesetzt" |
| `/referenzen` | 4 | „sichtbar, prüfbar, an einer Stelle" · „Was bei jedem Handgriff gilt, steht in der Hauptdatei" · „Ein Betrieb, der seine Abläufe messbar gemacht hat" · „mit einer Zahl dahinter" |
| `/leistungen` | 6 | „im Code sichtbar machen" · „Eine Regel mit Anlass ist eine Erfahrung" · „Wer den Ablauf einmal sauber zerlegt" · „Sitzt die Automatisierung nicht an diesem Vorgang" · „einen verwalteten Dienst in europäischer Region" · „Mit Regeln wird aus einem allgemeinen Werkzeug ein Bestandteil der Arbeit" |

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
npm run blog:pruefen -- was-passiert-wenn-eine-automatisierung-nachts-abstuerzt-fehlerbehandlung-und -v
npm run blog:freigeben -- was-passiert-wenn-eine-automatisierung-nachts-abstuerzt-fehlerbehandlung-und --von "Ayham Alkhalil"
npm test && npm run build
```
