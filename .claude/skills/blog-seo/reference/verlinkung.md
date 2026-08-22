# Interne Verlinkung

Jeder Artikel trägt **3 bis 8** interne Links im Fließtext (`interneLinks` in
`src/lib/wissen/schema.ts`, Pflichtfeld). Warum diese Spanne, warum jeder Link einen eigenen
Ankertext braucht, und warum der Build abbricht, wenn der Ankertext nicht im Absatz steht.

---

## Die Datenbasis — und ihre Grenze

Die einzige belastbare öffentliche Auswertung ist die **Zyppy-Studie von Cyrus Shepard**
([zyppy.com/seo/seo-study/](https://zyppy.com/seo/seo-study/), zuletzt aktualisiert
23.02.2026). Methodik wörtlich:

> „we analyzed **23 million internal links** across **1,800 websites**, totaling approximately
> **520,000 individual URLs**. We then compared these to data from Google Search Console to
> determine search clicks for each URL."

Die Autoren schränken selbst ein, und das gehört zu jeder Zahl unten dazu:

> „This is mostly a **correlation study**. Remember that correlation isn't causation […] We
> recommend you consider any conclusions drawn from these numbers **directionally useful but
> not necessarily scientific truth**."

Also: eine Richtung, kein Naturgesetz. Alles, was hier als Regel steht, ist eine Wette auf
diese Richtung — und sie ist billig, weil interne Links nichts kosten außer Sorgfalt.

---

## Was gemessen wurde

| Befund | Zahl | Deutung |
|---|---|---|
| Eingehende Links je Ziel-URL | URLs mit **0–4** eingehenden internen Links bekamen im Schnitt **2 Klicks** aus der Google-Suche, URLs mit **40–44** das **Vierfache** | Mehr hilft — bis zu einem Punkt |
| Der Wendepunkt | „After a URL receives about **45-50 internal links**, the effect **reverses**." Danach sinkt der Traffic mit steigender Linkzahl | Jenseits von ~50 sind es fast nur noch Navigations- und seitenweite Links |
| **Ankertext-Vielfalt** | Der **stärkste** Zusammenhang der ganzen Studie: „so strong that we ran the data three times. Even after eliminating nearly all the outliers (close to 50% of all URLs), the numbers kept increasing." | Nicht die Zahl der Links zählt, sondern ihre Unterschiedlichkeit |
| Wortgleicher Ankertext | „Pages with at least one exact match anchor had **at least five times more traffic** than pages without." | Mindestens einer je wichtiger Zielseite |
| Nackte URLs als Ankertext | „almost 50% more traffic" — bei unter 1 % Anteil im Datensatz | Überraschend gut, entgegen der verbreiteten Empfehlung. Kein Grund, es zu forcieren |
| Leerer Ankertext | 6 % aller Links, meist Bildlinks: „**no difference whatsoever**" | Bildlinks zählen nicht als Verlinkung. Wer verlinken will, verlinkt Text |

Der eigentlich brauchbare Satz der Studie ist die Erklärung zur Vielfalt:

> „a sitewide link might appear on every page of your site […] but it can only ever have
> **one** anchor text associated with it. Even if that link appears on 500 different pages, in
> some ways, it might be considered a **single editorial link**."

Daraus folgt der ganze Rest: Eine Fußzeile mit 20 Links erzeugt Zahlen, keine Wirkung.
Kontextuelle Links im Fließtext, jeder anders formuliert, erzeugen Wirkung. Die Autoren
merken zusätzlich an, dass große Websites mit Navigationslinks gut abschnitten,
„small-to-medium sites seemed to have **less success**" — für eine Domain dieser Größe heißt
das: **Navigation trägt wenig, Fließtext trägt.**

⚠️ **Zahlen, die kursieren und hier nicht verwendet werden:** „interne Verlinkung steigert
Rankings um bis zu 40 %", „verbessert die Crawl-Effizienz um 40–70 %". Beide tauchen in
mehreren SEO-Blogs auf und haben keine auffindbare Primärquelle.

---

## Die Regeln dieses Repos

| Regel | Wert | Warum genau so |
|---|---|---|
| Links je Artikel | **3 bis 8** | Unter 3 hängt der Artikel isoliert im Bestand. Über 8 wird der Fließtext zum Verzeichnis, und die Absätze müssen um die Anker herumgebaut werden, statt umgekehrt |
| Ankertext | **je Link ein eigener**, innerhalb eines Artikels nie zweimal derselbe | Der stärkste gemessene Zusammenhang. Der Test lehnt Wiederholungen im selben Artikel ab |
| Wortgleicher Anker | **mindestens einer je wichtiger Zielseite**, nicht alle | Der 5×-Befund — aber wenn alle wortgleich sind, ist die Vielfalt weg |
| Eingehende Links je Artikel | Zielkorridor **20 bis 40** | Der gemessene Anstieg reicht bis 40–44; ab 45–50 kehrt er sich um. 20–40 liegt sicher darunter |
| Klicktiefe | **höchstens drei** von der Startseite | John Mueller: „it's **more a matter of how many links you have to click through** to actually get to that content rather than what the URL structure itself looks like." URL-Verschachtelung zählt nicht, `/gratis-wissen/<slug>` ist unproblematisch |
| Aufbau | **Hub-and-Spoke** über die Themenseiten `/gratis-wissen/thema/<cluster>` | Der Hub verlinkt jeden Artikel seines Themas mit jeweils eigenem Ankertext und wird von jedem Artikel zurückverlinkt. Das erzeugt genau die Vielfalt, die die Studie misst, und hält die Klicktiefe bei zwei |

Automatisch geprüft in `src/lib/__tests__/wissen.test.ts`:

- Ziel existiert, kein Selbstlink, kein Ankertext zweimal im selben Artikel.
- **Kein Ziel über 60 eingehenden Links.** Der Schwellenwert liegt bewusst über dem
  Wendepunkt bei 45–50: Das ist kein scharfer Grenzwert, sondern ein Korridor. Ab 60 ist es
  kein Zufall mehr, sondern ein Muster, das jemand angesehen haben sollte.
- **Vielfalt je Zielseite über 0,4** (verschiedene Ankertexte geteilt durch Linkzahl), sobald
  eine Seite mindestens fünf Links bekommt.

---

## Der harte Teil: Der Ankertext muss wörtlich im Absatz stehen

Ein Link steht im Datenmodell als eigenes Feld neben dem Text, nicht als Markup darin — nur
so lässt er sich zählen und prüfen. Die Darstellung (`src/lib/wissen/verlinken.tsx`) sucht den
Ankertext dann im zugewiesenen Absatz und macht die Fundstelle zum Link.

**Findet sie ihn nicht, passiert nichts.** Kein Fehler, keine Warnung, kein Link — und in
jeder Auswertung steht er trotzdem, weil er im JSON eingetragen ist.

Genau das ist beim Umstellen der drei Bestandsartikel auf das neue Datenmodell passiert:
**fünfzehn eingetragene Links, null gerenderte.** Der Fehler war beim Draufschauen unsichtbar,
weil die Seite völlig normal aussah; sichtbar wurde er erst, als jemand die Zahl der Links im
HTML mit der Zahl im JSON verglich.

Die Gegenmaßnahme ist eine Zeile und sitzt an zwei Stellen:

| Wo | Was |
|---|---|
| `src/lib/wissen/laden.ts` | Beim Einlesen: steht `ankertext` wörtlich in `intro` bzw. in den Absätzen des zugewiesenen Abschnitts (inklusive Unterabschnitten)? Sonst **bricht der Build ab**, mit dem Ankertext und der Abschnittsnummer in der Meldung |
| `src/lib/__tests__/wissen.test.ts` | Dieselbe Prüfung als Test, damit `npm test` sie meldet, bevor der Build es tut |

Zwei Wege, den Fehler zu beheben, und beide sind erlaubt: den Ankertext an eine Formulierung
anpassen, die wirklich im Absatz steht — oder die Formulierung in den Absatz aufnehmen. Was
**nicht** geht, ist die Prüfung weich zu machen. Sie ist der einzige Grund, warum die
Verlinkungsstatistik dieses Bestands überhaupt etwas bedeutet.

Nebenwirkung, die dazugehört: Ein Ankertext wird über den ganzen Artikel **genau einmal** zum
Link gesetzt (`gesetzteLinks` in `ArtikelSeite.tsx`). Ohne diesen gemeinsamen Zustand stünde
derselbe Link in jedem Abschnitt, in dem die Formulierung zufällig vorkommt.

---

## Verwaiste Artikel — das Problem der täglichen Veröffentlichung

Eine Seite ohne eingehende interne Links ist über die Sitemap auffindbar, aber die Sitemap
überträgt kein Gewicht: sie ist Discovery, nicht Ranking.

Bei einem Artikel pro Tag entstehen Waisen **systematisch**, ohne dass jemand einen Fehler
macht: Artikel Nummer eins steht nach vierzig Tagen auf Seite drei der Übersicht und hat dann
faktisch **null** interne Links aus einem Fließtext. Die Paginierung ist der Feind, nicht die
Nachlässigkeit.

Zwei Gegenzüge, beide gebaut:

1. **Die Themenseiten** (`content/seo/cluster.json` → `/gratis-wissen/thema/<slug>`). Ein Hub
   ohne eigenen Text wäre eine Linkliste, deshalb verlangt das Schema zwei bis fünf Absätze
   Einleitung. Er hält jeden Artikel bei zwei Klicks von der Startseite.
2. **Schritt 08 der Automatik („Verlinken").** Er hängt den neuen Artikel nicht nur ein,
   sondern **schreibt Links aus älteren, thematisch passenden Artikeln auf ihn** — der Typ
   `VerlinkungsAenderung` in `scripts/blog-engine/lib/typen.ts` beschreibt genau das: Slug des
   zu ändernden Artikels, Ziel, Ankertext, Abschnitt. Das ist der einzige Weg, alte Artikel
   aus der Waisenzone zu holen: **nachverlinken statt nur vorverlinken.**

Wer Schritt 08 überspringt, weil „der Artikel ja seine eigenen Links hat", baut einen Bestand,
in dem jeder Artikel nach außen zeigt und keiner Zuflüsse bekommt.

`verlinkungsBild()` in `src/lib/wissen/laden.ts` gibt den Stand aus: je Zielpfad die Zahl der
eingehenden Links und die Menge der verwendeten Ankertexte. Das ist die Zahl, gegen die der
Korridor 20–40 geprüft wird.
