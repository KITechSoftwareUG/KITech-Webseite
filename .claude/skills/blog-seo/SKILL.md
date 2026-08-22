---
name: blog-seo
description: Use when writing, planning, auditing or automating articles for /gratis-wissen on kitech-software.de — the German SEO/GEO blog. Covers the article data model (content/wissen/*.json), the mandatory substance gate, house writing style, internal linking rules, and the daily pipeline under scripts/blog-engine/. Triggers on "neuer Blogartikel", "Artikel schreiben", "Gratis-Wissen", "SEO-Artikel", "Blog-Pipeline", "Themen-Pool", "Blogartikel prüfen", "warum rankt der Artikel nicht". Not for funnel/sales copy (use funnel-narrativ) or for the website's other pages.
version: 1.0.0
user-invocable: true
argument-hint: "[neu|pruefen|lauf|thema|audit] [slug-oder-thema]"
---

# blog-seo

Alles, was einen Artikel unter `/gratis-wissen` zu einem Artikel macht, der ranken darf:
Datenmodell, Substanzpflicht, Hausstil, Verlinkung, und die Automatik, die das täglich
ausführt.

**Trigger:** ein Blogartikel wird geschrieben, geprüft oder geplant; der Themen-Vorrat wird
gefüllt; ein Lauf der Automatik wird gestartet oder nachgesehen; ein Artikel rankt nicht und
jemand fragt warum.

**Nicht zuständig für:** Funnel- und Verkaufstexte (dafür `funnel-narrativ`), die übrigen
Seiten der Website, Design und Komponenten (die gibt `CLAUDE.md` vor).

---

## Der eine Satz, um den sich alles dreht

> **Was steht in diesem Artikel, das nicht auf den ersten zehn Ergebnissen steht?**

Wer die Frage nicht in einem Satz beantworten kann, schreibt den Artikel nicht. Alles
Weitere in diesem Skill ist Ausführung dieser einen Regel.

Der Grund ist nicht Geschmack. Google unterscheidet in der eigenen Anleitung zu generativen
Suchfunktionen zwischen „commodity content" (Beispiel dort: *„7 Tips for First-Time
Homebuyers"*) und Inhalten mit „unique expert or experienced takes that go beyond common
knowledge" — und setzt die Messlatte wörtlich so: nichts veröffentlichen, was *„could easily
be produced by a generative AI model"*.

Bei täglicher Veröffentlichung ist das keine Empfehlung, sondern die Grenze zwischen
erlaubtem und abgestraftem Vorgehen. Details und Belege: `reference/risiko.md`.

---

## Zwei Wege, einen Artikel zu schreiben

**Von Hand — kostet nichts, braucht keinen Zugang.** Der Normalfall, solange der
Bestand klein ist.

```bash
npm run blog:brief                 # welche Themen haben belegten Eigenanteil?
npm run blog:brief -- <thema-id>   # Briefing + JSON-Gerüst
```

Das Briefing zieht alles aus dem Repo: den Eigenanteil aus dem Vorrat, die
Abgrenzung zu den Nachbarartikeln im selben Thema, die freien Verlinkungsziele
mitsamt der schon vergebenen Ankertexte, die Hausstil-Kennzahlen. Dann wird
geschrieben — von Hand oder von einem Assistenten, der ohnehin schon läuft.

Beim Schreiben gilt: **erst den Absatz schreiben, dann eine Formulierung daraus
als Ankertext eintragen.** Andersherum entsteht ein Link, der nicht gerendert
wird und trotzdem in jeder Auswertung zählt.

**Mit der Automatik — rund 44 Cent je Artikel.** Für Volumen, wenn der Vorrat
gefüllt ist.

```bash
npm run blog:lauf -- --trocken     # kostet nichts, zeigt die Auswahl
npm run blog:lauf -- --anzahl 2
```

Sie kann eines, was der Handweg nicht kann: die Ergebnisseite lesen und
vergleichen, was die zehn Seiten schreiben, gegen die man antritt. Genau das
beantwortet die Frage oben. Ohne sie wird sie von Hand beantwortet.

**Beide Wege enden beim Entwurf** und laufen danach durch dieselben Tore:

```bash
npm run blog:pruefen -- <slug> -v
npm run blog:freigeben -- <slug> --von "Name"
```

---

## Setup — immer zuerst

1. **`reference/substanz-gate.md`** lesen. Das ist die Regel, die nie weich wird.
2. **`../../../scripts/blog-engine/prompts/hausstil.md`** lesen — der Schreibstandard.
   Er liegt bewusst dort und nicht hier: Die Automatik schickt genau diese Datei als
   System-Prompt. Zwei Fassungen desselben Standards wären zwei Standards.
3. Erst dann die passende Referenz zur Aufgabe (Tabelle unten). **Nicht alle auf Verdacht
   laden.**

| Aufgabe | Referenz |
|---|---|
| Artikel schreiben oder gliedern | `reference/struktur.md` |
| Interne Links setzen | `reference/verlinkung.md` |
| Themen-Vorrat füllen | `reference/substanz-gate.md` + `reference/themen.md` |
| Lauf starten, Entwürfe freigeben, Fehler suchen | `reference/betrieb.md` |
| „Warum rankt das nicht", Risiko einschätzen | `reference/risiko.md` |

---

## Wo was liegt

| Was | Wo |
|---|---|
| Ein Artikel | `content/wissen/<slug>.json` — eine Datei, eine URL |
| Datenmodell und Grenzen | `src/lib/wissen/schema.ts` (Zod) |
| Autoren | `content/seo/autoren.json` → `/autoren/<slug>` |
| Themenfelder | `content/seo/cluster.json` → `/gratis-wissen/thema/<slug>` |
| Themen-Vorrat | `content/seo/themen-pool.json` |
| Darstellung | `src/views/wissen/` — Server Components, kein `"use client"` |
| Automatik | `scripts/blog-engine/` |
| Prüfungen | `scripts/blog-engine/lib/qualitaet.ts` + `src/lib/__tests__/wissen.test.ts` |

---

## Die sechs harten Tore

Jedes bricht den Build oder den Lauf ab. Keines ist verhandelbar, und keines lässt sich
„für diesen einen Fall" umgehen — wer eines aufweicht, nimmt der Automatik genau die
Bremse, wegen der sie verantwortbar ist.

1. **Substanz.** `substanz` ist Pflicht und muss einen echten Eigenanteil benennen — eine
   Messung, eine Konfiguration, eine Entscheidung mit Begründung, einen Fehler mit Kosten.
   Themen ohne Substanz werden nicht produziert. → `reference/substanz-gate.md`
2. **Ein Keyword, ein Artikel.** Zwei Artikel auf dasselbe Ziel konkurrieren gegeneinander
   statt gegen den Wettbewerb. Der Loader bricht bei Dubletten ab.
3. **Keine Zahl ohne Beleg.** Jede Fremdzahl braucht einen Eintrag in `quellen` mit URL und
   Abrufdatum. Eine erfundene Marktzahl ist genau die Sorte Aussage, die abgemahnt wird.
4. **Namentlicher Autor.** Nie ein Modell. Google rät ausdrücklich davon ab, einer KI eine
   Byline zu geben.
5. **Ankertext im Text.** Jeder interne Link braucht seinen Ankertext wörtlich im
   zugewiesenen Absatz — sonst wird er nicht gerendert und zählt trotzdem in jeder
   Statistik. Genau das ist beim Umstellen der Bestandsartikel passiert: fünfzehn
   eingetragene Links, null gerenderte.
6. **Freigabe vor Veröffentlichung.** `status: "veroeffentlicht"` verlangt ein
   `freigabe`-Objekt mit Namen und Datum.

---

## Was nie gebaut wird

- **FAQPage-Schema.** Google hat das Rich Result zum 07.05.2026 abgeschaltet und die
  Dokumentation im Juni entfernt. Der sichtbare Frage-Antwort-Block bleibt — das Markup
  nicht.
- **`keywords`, `wordCount`, `articleSection`, `speakable` im JSON-LD.** Schema.org-gültig,
  aber in Googles Article-Dokumentation kommen sie nicht vor. Ballast, der so aussieht, als
  täte er etwas.
- **`priority` und `changefreq` in der Sitemap.** Google ignoriert beide ausdrücklich.
- **Ein zweiter CTA im Artikel.** Genau einer, ganz am Ende. Wer über die Suche kommt, sucht
  eine Antwort, keinen Verkaufstext.
- **Eine zweite Domain für mehr Volumen.** Das ist wörtlich ein Beispiel aus Googles
  Spam-Richtlinie („Creating multiple sites with the intent of hiding the scaled nature of
  the content") und wird zusätzlich als Umgehung behandelt.
- **Automatisierter Linkaufbau.** Die Richtlinie verbietet „Using automated programs or
  services to create links to your site". Der `backlink-radar.ts` findet Gelegenheiten für
  Ansprache durch Menschen — er baut keine Links.

---

## Ein Artikel, kurz

```
Kopf        Thema · Lesezeit · H1 · Byline mit Link auf die Autorenseite · Intro
Kernaussagen  2–4 Sätze, für sich zitierfähig, ganz oben
Inhalt      Sprungmarken ab vier Abschnitten
Abschnitte  H2 möglichst als Frage, Antwort im ersten Satz darunter
Fazit       ein abgesetzter Satz
Fragen      sichtbarer FAQ-Block, ohne Markup
Quellen     jede Zahl mit URL und Abrufdatum
Autor       Foto, Rolle, Hintergrund
Weiter      drei Artikel aus demselben Thema, dann der nächste, dann der CTA
```

Warum diese Reihenfolge: `reference/struktur.md`.

---

## Prüfen vor dem Freigeben

```bash
npm test                       # Schema, Verlinkung, Routen — alles zusammen
npm run build                  # bricht bei jedem Schemafehler ab
node --experimental-strip-types scripts/blog-engine/pruefe.ts <slug>   # Hausstil einzeln
```

Der Hausstil-Prüfer meldet **harte Fehler** (Artikel geht so nicht live) und **Warnungen**
(ansehen, dann entscheiden). Er kennt 39 harte und 42 weiche Regeln. Was er nicht prüfen
kann, ist die einzige Frage, die zählt — die oben.
