# Das Substanz-Tor

Die Regel, wegen der eine tägliche Veröffentlichung hier verantwortbar ist und anderswo zur
Abstrafung führt. Sie steht als Pflichtfeld im Datenmodell (`substanz` in
`src/lib/wissen/schema.ts`), wird vom Loader erzwungen und von Schritt 02 der Automatik
geprüft.

---

## Warum es das gibt

Google beschreibt in der Anleitung zu generativen Suchfunktionen zwei Sorten Inhalt, und die
Beispiele stammen von Google selbst:

> „**Commodity content** (for example, something like ‚7 Tips for First-Time Homebuyers') is
> often based on common knowledge, which could originate from anyone, and typically adds
> little unique insight for readers. In contrast, **non-commodity content** (such as ‚Why We
> Waived the Inspection & Saved Money: A Look Inside the Sewer Line') provides unique expert
> or experienced takes that go beyond common knowledge and the ordinary."

Und die Messlatte, ebenfalls wörtlich:

> „Don't just recycle what others on the internet have already said, **or could easily be
> produced by a generative AI model**."

Dazu die Bewertungsanleitung für Googles Prüfer (Fassung vom 11.09.2025, Abschnitt 4.6.5),
die den Begriff „Effort" definiert:

> „Consider the extent to which **a human being actively worked** to create satisfying
> content."

Und entlastend im selben Absatz:

> „the use of Generative AI tools alone does not determine the level of effort or Page
> Quality rating. Generative AI tools may be used for high quality and low quality content
> creation."

**Daraus folgt der ganze Aufbau dieser Automatik:** Nicht das Werkzeug entscheidet, sondern
ob ein Mensch etwas beigetragen hat, das die Maschine nicht haben kann. Das Feld `substanz`
ist die Stelle, an der dieser Beitrag festgehalten wird — nachprüfbar, vor dem Schreiben.

---

## Die sechs erlaubten Arten

`substanz.art` kennt genau diese Werte. Jeder verlangt etwas anderes.

| Art | Was es bedeutet | Was in `herkunft` steht |
|---|---|---|
| `eigene-messung` | Eine Zahl aus einem echten Betrieb oder Projekt: Laufzeit, Stückzahl, Kosten, Fehlerquote, Vorher/Nachher | Woher die Zahl kommt, wann gemessen wurde, über welchen Zeitraum |
| `eigener-code` | Eine Konfiguration, ein Schema, ein Ausschnitt aus einer Datei, die wirklich läuft | Repo und Pfad, bei fremdem Code die Freigabe |
| `architekturentscheidung` | Warum so und nicht anders — mit der Alternative, die verworfen wurde, und dem Grund | Wo die Entscheidung dokumentiert ist |
| `fehlerbericht` | Was schiefging, wie es sich äußerte, was es gekostet hat, was daraus folgte | Wann, in welchem Zusammenhang |
| `primaerquelle` | Auswertung eines Originals: Gesetzestext, Amtsblatt, Norm, Herstellerdokumentation — nicht eines Ratgebers darüber | Fundstelle mit Datum, möglichst mit Aktenzeichen oder Artikelnummer |
| `prozesszerlegung` | Ein realer Ablauf, Schritt für Schritt, mit den Stellen, an denen er bricht | Welcher Ablauf, aus welchem Zusammenhang |

---

## Die sieben Prüffragen

Vor dem Eintrag im Themen-Vorrat. Wenn keine davon mit Ja beantwortet wird, bleibt
`substanz: null` — und das Thema wird nicht produziert.

1. **Bildschirm** — Gibt es etwas zu zeigen? Eine Datei, eine Konfiguration, eine
   Auswertung, einen Verlauf?
2. **Zahl** — Steht eine gemessene Größe dahinter, die niemand sonst hat?
3. **Fehler** — Ist etwas schiefgegangen, das man beschreiben kann, ohne jemandem zu
   schaden?
4. **Entscheidung** — Wurde zwischen zwei Wegen gewählt, und lässt sich der Grund benennen?
5. **Reihenfolge** — Kennt jemand die Reihenfolge, in der es tatsächlich gemacht werden
   muss, statt der Reihenfolge, in der es in Anleitungen steht?
6. **Original** — Wurde eine Primärquelle gelesen, die die rankenden Seiten nur zitieren?
7. **Nachbau** — Kann eine fremde Person danach etwas nachbauen, das vorher nicht ging?

---

## Was NICHT als Substanz zählt

Diese Formulierungen werden vom Prüfmodul erkannt und abgelehnt
(`scripts/blog-engine/lib/qualitaet.ts`, Regel `substanz-generisch`):

- „umfassende Erfahrung", „langjährige Praxis", „tiefes Verständnis", „unsere Expertise"
- „aus vielen Kundenprojekten" ohne einen konkreten Fall
- „wir wissen aus der Praxis, dass …" ohne die Praxis zu nennen
- eine Zusammenfassung dessen, was in der Recherche stand — auch eine gute
- eine eigene Meinung ohne etwas, worauf sie sich stützt
- „Best Practices", „bewährte Vorgehensweisen", „Erfolgsfaktoren"

Eine Meinung ist keine Substanz. **Eine Meinung mit einem Beleg dahinter schon.**

---

## Vertraulichkeit — was nie in einen Artikel darf

Das Erstquellen-Inventar hat beim Durchsehen der Projekte mehrere Stellen markiert, die
unter keinen Umständen veröffentlicht werden dürfen. Sie stehen hier, weil ein Thema mit
echter Substanz oft genau daneben liegt:

- **Kundennamen ohne dokumentierte Freigabe.** Belegt und freigegeben ist nur, was in
  `src/data/client-results.ts` ohne offene Punkte steht. Alles andere nicht — auch nicht
  „anonymisiert", wenn die Branche identifizierend ist.
- **Zugangsdaten jeder Art**, auch als Beispiel, auch abgelaufen.
- **Server-Adressen, Anwendungskennungen, Projektkennungen, Dienst-Hostnamen.** In Artikeln
  durch Platzhalter ersetzen.
- **Interne Preise, Stundensätze, Haftungsgrenzen, Vertragsklauseln.** Der *Gedanke* hinter
  einer Vertragsgestaltung ist veröffentlichbar, der Text nicht.
- **Eigene offene Rechtsrisiken.** Was im Repo als offener Punkt dokumentiert ist, ist ein
  Arbeitsstand — kein Artikelthema.
- **Mängel in Kundenprojekten.** Auch als Lehrbeispiel nicht.
- **Fremdes geistiges Eigentum.** Methoden aus gekauften Kursen, Büchern oder fremden Skills
  werden nicht als eigene Erkenntnis ausgegeben. Die *Methode der Zerlegung* darf man
  beschreiben, die Inhalte nicht.

Im Zweifel: `substanz: null` und eine Notiz, was zur Freigabe fehlt.

---

## Wie ein guter Eintrag aussieht

```json
"substanz": {
  "art": "fehlerbericht",
  "beschreibung": "Fünfzehn interne Links waren im Datenmodell eingetragen, wurden gezählt und tauchten in jeder Auswertung auf — gerendert wurde keiner davon, weil der Ankertext nicht im Absatz stand. Der Fehler war vier Wochen unsichtbar.",
  "herkunft": "Umstellung des Wissensbereichs auf das neue Datenmodell, 19.08.2026. Prüfung liegt seither im Loader und im Test.",
  "material": [
    "Der Link steht als eigenes Feld neben dem Text, nicht als Markup darin — damit das Schema ihn zählen und prüfen kann.",
    "Die Gegenmaßnahme ist eine Zeile: Steht der Ankertext wörtlich im zugewiesenen Abschnitt? Sonst bricht der Build ab."
  ]
}
```

Was diesen Eintrag trägt: Es ist etwas passiert, es ist nachprüfbar, es hat eine Konsequenz,
und niemand sonst kann es erzählen.

---

## Und wenn es kein Thema mit Substanz mehr gibt?

Dann erscheint an diesem Tag kein Artikel. Das ist kein Ausfall, sondern der vorgesehene
Zustand.

Googles Prüfliste für hilfreiche Inhalte nennt als Warnsignal wörtlich:

> „Are you adding a lot of new content … primarily because you believe it will help your
> search rankings overall by somehow making your site seem ‚fresh?' **(No, it won't)**"

Der Klammersatz ist Googles eigener. Ein leerer Tag kostet nichts. Ein Artikel ohne
Eigenanteil kostet die Domain.

Was stattdessen zu tun ist: den Themen-Vorrat füllen. Das ist die einzige Arbeit an dieser
Automatik, die ein Mensch machen muss — und sie ist einmalig statt täglich.
