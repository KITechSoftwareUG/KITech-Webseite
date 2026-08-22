# Aufbau eines Artikels

Warum die Blöcke in dieser Reihenfolge stehen, wie tief gegliedert wird, und wie lang ein
Text sein darf. Gerendert wird das in `src/views/wissen/ArtikelSeite.tsx`; die Felder dahinter
stehen in `src/lib/wissen/schema.ts`.

**Vorab zur Beleglage.** Die Zahlen unten kommen aus zwei Sorten Quelle, und der Unterschied
entscheidet, wie weit man ihnen folgt:

| Sorte | Beispiel | Wie weit man geht |
|---|---|---|
| Auswertung echter Ausgaben | Kevin Indig, 18.02.2026: 3 Mio. ChatGPT-Antworten, 30 Mio. Zitate, davon **18.012 verifiziert** per Sentence-Transformer-Matching (Search Engine Land) | Handlungsleitend, aber Korrelation |
| Preprint mit Modell-Jurys | *Structural Feature Engineering for GEO*, arXiv 2603.29979: 200 Artikel, 377 Queries, 6 Engines, 2.400 Testfälle — bewertet von **LLM-Judges**, nicht von Menschen | Richtungsangabe, kein Maß |

**Bei Widerspruch gilt der Hausstil.** Er ist an den handgeschriebenen Bestandsartikeln
gemessen (`scripts/blog-engine/prompts/hausstil.md`, Auszählung über 63 Sätze, 28 Absätze,
1.340 Wörter) und ist eine Vorgabe. Ein Preprint ist eine Beobachtung.

---

## Die Blockreihenfolge

Was die Seite von oben nach unten ausgibt, und woraus es kommt.

| # | Block | Feld | Warum hier |
|---|---|---|---|
| 1 | Themen-Pille, Lesezeit, H1 | `cluster`, `lesezeit`, `titel` | Die H1 ist der Anker, an dem ChatGPT sein Snippet aufhängt: davor, die H1 selbst, dann der Rest — bei labrador-Ergebnissen höchstens 202 Zeichen (Resoneo, 1.249 Antworten / 88.000 Suchergebnisse) |
| 2 | Byline mit Link auf die Autorenseite | `autor` | Googles Prüfliste für hilfreiche Inhalte fragt wörtlich: „Do pages carry a byline …?" Nie ein Modell |
| 3 | Datum, ggf. Aktualisierungsdatum | `datum`, `aktualisiert` | Speist `lastmod` und `dateModified` |
| 4 | Intro | `intro` | Erste Textstelle im ersten Drittel — siehe unten |
| 5 | **„Das Wichtigste in Kürze"** | `kernaussagen` | **44,2 % der 18.012 verifizierten ChatGPT-Zitate stammen aus den ersten 30 % des Inhalts**, 31,1 % aus der Mitte, 24,7 % aus dem letzten Drittel mit scharfem Abfall zum Fuß hin (Indig). Deshalb stehen die zitierfähigen Sätze **oben**, nicht als Zusammenfassung unten |
| 6 | Sprungmarken | automatisch ab 4 Abschnitten | Macht die Gliederung als Liste sichtbar, ohne einen Block zu erfinden |
| 7 | Abschnitte: H2, Absätze, Aufzählung, höchstens eine Tabelle, optional H3 | `abschnitte` | Der Textkörper. Regeln dazu unten |
| 8 | Fazit | `fazit` | Ein abgesetzter Satz, kein zweiter Artikel |
| 9 | Häufige Fragen, sichtbar | `faq` | **Ohne FAQPage-Markup.** Google hat das Rich Result am 07.05.2026 abgeschaltet; was messbar wirkt, ist die sichtbare Frage-Antwort-Struktur im HTML |
| 10 | Quellen mit URL und Abrufdatum | `quellen` | „Cite Sources" ist im Princeton-Paper (KDD 2024, arXiv 2311.09735) mit ~+28 % der drittstärkste Hebel, bei schlecht rankenden Seiten bis +115 % |
| 11 | Autorenkasten | `autor` | Wiederholt die Person am Ende, wo die Frage „wer sagt das" tatsächlich aufkommt |
| 12 | Weiter im Thema, dann der nächste Artikel | Cluster | Gegen verwaiste Artikel — siehe `verlinkung.md` |
| 13 | **Genau ein** CTA | `cta` | Wer über die Suche kommt, sucht eine Antwort. Ein zweiter CTA im Text ist verboten |

Was an dieser Reihenfolge nicht verhandelbar ist: **Kernaussagen oben.** Sie unten als
Zusammenfassung zu setzen, ist die häufigste Umstellung, die jemand vorschlägt — und sie
verschiebt die zitierfähigsten Sätze aus dem Drittel, aus dem 44,2 % der Zitate kommen, in
das, aus dem 24,7 % kommen.

---

## H2 als Frage

Die Überschrift trägt die Frage, der erste Satz darunter die Antwort in ein bis zwei Sätzen.

- **78,4 % der frage-verknüpften Zitate stammen aus einer H2** (Indig, 18.012 verifizierte
  Zitate). Fragezeichen tauchen in zitierten Passagen doppelt so häufig auf.
- **KI-Übersichten erscheinen bei 13,7 % aller Suchen — aber bei 64,7 % der fragenförmig
  formulierten** (arXiv 2607.14035, kritischer GEO-Survey über 45 Studien). Eine Frage als
  Überschrift ist damit auch eine Wette darauf, in welcher Sorte Ergebnisseite man landet.
- Der Hausstil verlangt: **mehr als die Hälfte der H2 sind Fragen.** Nicht alle — ein Text
  aus lauter Fragen liest sich wie ein Fragebogen.

Fragezeichen gehören in Überschriften, Listenpunkte und den Frage-Antwort-Block. **Nicht** als
rhetorische Frage in den Fließtext; der Hausstil-Prüfer meldet das.

---

## Definitionssprache

**Definitionssätze („X ist …", „X bezeichnet …") tauchen in zitierten Passagen fast doppelt
so häufig auf** wie in nicht zitierten (Indig). Es ist der billigste Hebel der ganzen Liste.

Konkret: Im Intro oder in der ersten Kernaussage steht ein Satz in Definitionsform. Er darf
der zweite Satz sein — der erste benennt den Irrtum, das ist die Hausstil-Eröffnung.

---

## Der Absatz-Konflikt — und wie er aufgelöst wird

Hier widersprechen sich Quelle und Hausstil offen, und das muss jeder wissen, der hier
etwas ändern will.

| | Vorgabe | Herkunft |
|---|---|---|
| GEO-SFE (arXiv 2603.29979) | Absätze von **150 bis 300 Wörtern** | Preprint, Modell-Jurys als Bewerter, Effekt als „mittel" eingestuft |
| Hausstil dieser Website | **34 Wörter im Mittel**, Korridor 25–45, **hart gedeckelt bei 55** | Auszählung des Bestands; längster gemessener Absatz: 54 Wörter |

**Der Hausstil gewinnt.** Ein Absatz von 200 Wörtern ist auf einem Handy eine Wand, und er
entsteht fast immer dadurch, dass drei Gedanken zusammengeschoben wurden, statt einen zu Ende
zu bringen. Der Prüfer lehnt alles über 55 Wörtern hart ab.

**Die Auflösung: Der Korridor gilt für den Abschnitt, nicht für den Absatz.**

> Ein H2-Abschnitt umfasst **insgesamt 150 bis 300 Wörter**, aufgeteilt in **mehrere kurze
> Absätze** zu je zwei bis drei Sätzen.

Damit ist beides erfüllt: Der zusammenhängende Sinnblock hat die Länge, die die Studie misst,
und die einzelne Textwand entsteht nicht. Wer später „die Absätze etwas ausbauen" will, weil
in einer GEO-Quelle 150 bis 300 Wörter stehen, hat genau diese Unterscheidung übersehen.

Zweiter Grund, warum das trägt: **Innerhalb von Absätzen stammen 53 % der Zitate aus der
Mitte**, nur 24,5 % aus dem ersten und 22,5 % aus dem letzten Satz (Indig). Auf Absatzebene
schlägt Dichte die Position. Also **nicht jeden Absatz mit einem Knallsatz beginnen** — das
ist eine Copywriting-Gewohnheit, die hier nichts einbringt und den Text gleichförmig macht.
Die „Antwort zuerst"-Regel gilt auf **Dokument-** und **Abschnittsebene**, nicht auf
Absatzebene.

---

## Struktur-Korridore

Aus GEO-SFE (Preprint, deshalb als Richtung zu lesen, nicht als Zielwert):

| Größe | Korridor | Anmerkung |
|---|---|---|
| Überschriftentiefe | **3 bis 5 Ebenen** | Saubere H1 → H2 → H3-Kette. Das Schema erlaubt genau diese Tiefe: `abschnitte[].heading` als H2, `unterabschnitte[].heading` als H3 |
| Anteil strukturierter Elemente (Listen, Tabellen) | **25 bis 35 %** des Inhalts | **Ein Optimum, kein Maximum.** Über etwa 35 % kippt der gemessene Effekt |
| Hervorhebungen | 5 bis 10 % der Tokens | |

Der Anteilswert ist der Grund, warum das Schema **höchstens eine Tabelle je Abschnitt** und
höchstens sieben Aufzählungspunkte erlaubt. Strukturierte Formatierung wird laut derselben
Quelle mit 43 % höherer Extraktionsgenauigkeit ausgelesen als äquivalenter Fließtext — daraus
folgt aber nicht, dass mehr immer besser ist. **Kachelwüsten helfen nicht**, und sie
widersprechen zusätzlich der Repo-Vorgabe „Listen mit Trennlinien statt Kacheln"
(`CLAUDE.md`).

Der stärkste Einzelposten in derselben Auswertung ist die **Makrostruktur** — Überschriften
und Hierarchie machen 44,9 % des gemessenen Gesamtgewinns aus, Absätze und Formatierung
39,7 %, Hervorhebungen 15,4 %. Wer Zeit hat, steckt sie in die Gliederung, nicht in Fettungen.

---

## Entity-Dichte: Namen statt Kategorien

**In stark zitiertem Text sind 20,6 % der Wörter Eigennamen, gegenüber 5 bis 8 % in normalem
Text** (Indig). Das ist der Unterschied zwischen einem Artikel, der zitiert wird, und einem,
der nach Marketing klingt.

Praktisch heißt das: `n8n`, `Supabase`, `Next.js`, `DATEV`, `XRechnung`, `Bundesnetzagentur`,
`Hannover`, `Art. 17 DSGVO` — statt „moderne Technologien", „gängige Werkzeuge", „die
zuständige Behörde". Der Hausstil zieht daraus die Faustregel: **mindestens jedes zwölfte
Wort im Fließtext ist eine konkrete Benennung.**

Die Grenze zieht `substanz-gate.md`: Produkt-, Norm- und Ortsnamen ja; Kundennamen ohne
dokumentierte Freigabe, Hostnamen, Projektkennungen und Zugangsdaten nie.

---

## Umfang

**Es gibt keine Ziel-Wortzahl.** John Mueller, wörtlich:

> „Word count is not a ranking factor. Save yourself the trouble."

Und Google im AI-Optimization-Guide (Mai 2026): „There's **no ideal page length**, and in the
end, make pages for your audience, not just for generative AI search."

Was die Korrelationsdaten hergeben:

- **Backlinko/Ahrefs, 11,8 Mio. Suchergebnisse:** ein Top-10-Ergebnis hat im Schnitt 1.447
  Wörter — aber die Wortzahl ist über die Positionen 1 bis 10 **gleichmäßig verteilt**. Länge
  ist ein Merkmal von Seiten, die es auf Seite 1 schaffen, kein Sortierkriterium darauf.
- **Ahrefs, ~900 Mio. Seiten:** Wortzahl und verweisende Domains hängen bis etwa **1.000
  Wörter** positiv zusammen, darüber negativ; Wortzahl und organischer Traffic bis etwa
  **2.000 Wörter** positiv, darüber negativ.
- **Für KI-Übersichten** hat Ahrefs die Spearman-Korrelation zwischen Wortzahl und
  Zitierposition mit **0,04** gemessen — praktisch null.

**Der brauchbare Korridor: 1.000 bis 2.000 Wörter.** Nicht weil Google mitzählt, sondern weil
ein Thema in dieser Länge typischerweise vollständig behandelt ist. Darunter fehlt meist die
Tiefe, darüber beginnt Streckung. Der Brief (`Brief.zielWortzahl`) leitet den Wert aus der
Recherche ab, nicht aus einer Vorgabe — er ist ein Anhaltspunkt, keine Quote.

Was stattdessen zählt, ist im Princeton-Paper (KDD 2024) gemessen: **Statistiken mit
Quellenangabe ~+41 %**, **wörtliche Zitate mit Name und Rolle ~+41 %**, **Quellenangaben
~+28 %** — während **Keyword-Dichte null bis negativ** wirkt. Ein Absatz mit einer belegten
Zahl schlägt drei Absätze Fülltext.

---

## Was Struktur nicht kann

Der kritische Survey über 45 Studien (arXiv 2607.14035) kommt zum Schluss: **keine einzige
GEO-Technik zeigt einen stabilen, plattformübergreifenden Kausaleffekt auf organische
Auffindbarkeit.** Reine Textoptimierung ohne Retrieval-Basis senkt in einem der Testaufbauten
die Top-10-Präsenz nach Reranking um 16 %.

Die Reihenfolge, die zuverlässig wirkt: **(1) technisch abrufbar → (2) im Index → (3)
strukturell extrahierbar → (4) off-site als Entität bekannt.** Dieses Dokument beschreibt
Schritt 3. Ohne Schritt 1 und 2 ist er verschwendete Zeit, und ohne den Eigenanteil aus
`substanz-gate.md` ist er verschwendet, egal wie sauber gegliedert wird.
