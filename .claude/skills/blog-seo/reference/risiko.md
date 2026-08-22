# Risiko: was bei täglicher Veröffentlichung tatsächlich auf dem Spiel steht

Diese Datei ist die ehrliche Fassung. Sie steht hier, damit jede spätere Entscheidung über
Frequenz, Umfang oder Aufweichung der Tore auf einer belegten Grundlage getroffen wird und
nicht auf einem Gefühl.

Alle Zitate sind wörtlich aus Primärquellen, Stand 19.08.2026.

---

## Die Regel, gegen die verstoßen werden kann

Googles Spam-Richtlinie, Abschnitt „Scaled content abuse" (Stand der Seite 15.05.2026,
deutscher Name „Missbrauch mit massenhaft generierten Inhalten"):

> „**Scaled content abuse is when many pages are generated for the primary purpose of
> manipulating search rankings and not helping users.** This abusive practice is typically
> focused on creating large amounts of unoriginal content that provides little to no value to
> users, no matter how it's created."

Als Beispiel ausdrücklich genannt:

> „Using generative AI tools or other similar tools to generate many pages **without adding
> value for users**"

Und der Satz, der am häufigsten übersehen wird:

> „If you're hosting such content on your site, **exclude it from Search**."

**Drei Bedingungen müssen zusammenkommen:** viele Seiten, Primärzweck Ranking statt Nutzen,
und unoriginell. Die Methode ist ausdrücklich egal — *„no matter how it's created"* schneidet
in beide Richtungen: KI rettet nichts, KI belastet aber auch nichts von allein.

---

## Was Google zu KI-Inhalten sagt

Die verbindliche Aussage stammt von Danny Sullivan und Chris Nelson, 08.02.2023, und ist
seither unverändert:

> „**Using AI doesn't give content any special gains.** It's just content. If it is useful,
> helpful, original, and satisfies aspects of E-E-A-T, it might do well in Search. If it
> doesn't, it might not."

> „If you see AI as an essential way to help you produce content that is helpful and
> original, it might be useful to consider. **If you see AI as an inexpensive, easy way to
> game search engine rankings, then no.**"

Zur Autorenfrage:

> „Giving AI an author byline is probably not the best way to follow our recommendation to
> make clear to readers when AI is part of the content creation process."

→ Deshalb prüft das Datenmodell den Autor gegen `content/seo/autoren.json`. Es gibt keinen
Weg, ohne benannten Menschen zu veröffentlichen.

---

## Die Warnsignal-Liste, die dieses Vorhaben streift

Aus „Creating helpful, reliable, people-first content". Google nennt das ausdrücklich
Warnsignale, bei denen man das eigene Vorgehen überdenken soll:

> - „Are you **producing lots of content on many different topics** in hopes that some of it
>   might perform well in search results?"
> - „Are you **using extensive automation** to produce content on many topics?"
> - „Are you adding a lot of new content … primarily because you believe it will help your
>   search rankings overall by somehow making your site seem ‚fresh?' **(No, it won't)**"

Zwei davon trifft eine tägliche Automatik ohne Gegenmaßnahmen direkt. Die Gegenmaßnahmen in
diesem Repo:

| Warnsignal | Gegenmaßnahme im Bau |
|---|---|
| Viele Themen auf Verdacht | Zwölf feste Themenfelder, Artikel nur aus dem gepflegten Vorrat — kein Streuen |
| Weitgehende Automatisierung | Das Substanz-Tor: ohne belegten Eigenanteil wird nichts produziert |
| Menge für Frische | Kein Kalenderzwang. Ist der Vorrat leer, erscheint nichts |

---

## Wie bewertet wird: auf Seitenebene oder auf Website-Ebene?

Aus den Bewertungsrichtlinien für Googles Prüfer, Fassung 11.09.2025:

> „Pages and websites made up of content created at scale with no original content or added
> value for users should be rated Lowest — no matter how they are created. Even if you are
> unsure of the method of creation … you should still use the Lowest rating **when you
> strongly suspect scaled content abuse after looking at several pages on the website**."

**Das ist der gefährlichste Satz für ein Firmenprofil.** Es gibt keine Quarantäne für den
Blog. Ein Urteil auf Website-Ebene zieht `/leistungen`, `/referenzen`, die Kampagnenseiten
und die Suche nach dem Firmennamen mit hinein.

Dasselbe gilt für die manuelle Maßnahme. Aus der Search-Console-Hilfe:

> „**Major spam problems** — The site appears to use aggressive spam techniques such as
> **scaled content abuse**, cloaking, and/or other repeated or egregious violations of
> Google's spam policies."

Die Beschreibung ist site-weit formuliert („The site appears…", „Update your site"). Dauer
einer Wiederaufnahme laut Google: *„several days or weeks"* — und zwar erst **nach**
vollständiger Bereinigung.

---

## Was die Datenlage hergibt und was nicht

**Es gibt keine Studie, die eine sichere Frequenz belegt.** Wer eine Zahl nennt, zitiert
SEO-Blogs ohne Methodik. Belastbar ist Folgendes:

- **Lily Ray**, Kohorte von über 220 Domains, die sich selbst oder deren Anbieter sich
  öffentlich als Nutzer von KI-Content-Werkzeugen zu erkennen gaben: **54 % verloren
  mindestens 30 %** ihres Traffic-Höchststands, **39 % mindestens 50 %**, **22 % mindestens
  75 %**. Muster: sechs bis zwölf Monate Anstieg, Höhepunkt drei bis sechs Monate nach dem
  Content-Höhepunkt, dann Absturz **unter das Ausgangsniveau**.
  ⚠️ Die Kohorte ist positiv selektiert und hat keine Kontrollgruppe. Sie trägt kein
  Eintrittsrisiko — sie zeigt ein Muster.
- **Ahrefs**, Auswertung von rund 150.000 Seiten mit auswertbarem Textanteil aus 100.000
  Suchergebnisseiten (veröffentlicht 27.07.2026): **5,3 % der Ergebnisse auf den Plätzen 1
  bis 3 sind zu 100 % KI-generiert**, 9 % haben mindestens 80 % KI-Anteil. Die Autoren
  ziehen daraus ausdrücklich den Schluss, dass vollständig KI-geschriebene Seiten ganz oben
  ranken *können*. Gleichzeitig: Seiten mit niedrigem bis mittlerem KI-Anteil bekamen zwei-
  bis dreimal so viele Impressionen. Ihr Fazit: *„Google is not against AI content; it is
  against bad content, but confusion arises because AI content and bad content overlap
  significantly."*
- **Pew Research**, 900 Personen, 68.879 Suchen: Steht eine KI-Übersicht über den
  Ergebnissen, klicken Nutzer in **8 %** der Fälle auf ein Ergebnis, ohne sie in **15 %**.

**Was daraus folgt:** Das Risiko liegt nicht darin, dass KI beim Schreiben hilft. Es liegt
darin, im Akkord genau die Sorte Inhalt zu produzieren, die im Überfluss existiert, von
KI-Übersichten abgefangen wird und das größte Richtlinienrisiko trägt.

---

## Google fährt drei Spam-Updates in fünf Monaten

Aus dem Search-Status-Dashboard: Spam-Update im **März 2026**, im **Juni 2026**, und ein
**August-2026-Update**, das am 18.08.2026 gestartet ist — dem Tag, bevor dieser Aufbau
entstand. Wörtlich: *„Released the August 2026 spam update, which applies globally and to all
languages."*

Das ist der Takt, in dem dieses Vorhaben bewertet wird. Ein Vorsprung, der zwischen zwei
Updates entsteht, ist keiner.

---

## Links: was verboten ist

Aus derselben Richtlinie:

> „Link spam is the practice of creating links to or from a site **primarily for the purpose
> of manipulating search rankings**."

Ausdrücklich genannt, unter anderem:

> - „Buying or selling links for ranking purposes …"
> - „**Using automated programs or services to create links to your site**"
> - „Advertorials or native advertising where payment is received for articles that include
>   links that pass ranking credit, or links with **optimized anchor text** in articles, guest
>   posts, or press releases distributed on other sites"
> - „Low-quality directory or bookmark site links"

Und die Ausnahme, ebenfalls wörtlich:

> „It's not a violation of our policies to have such links **as long as they are qualified
> with a `rel="nofollow"` or `rel="sponsored"` attribute**."

**Was legitim bleibt:** eigene Daten, die jemand freiwillig zitiert; Fachverbands- und
Kammerverzeichnisse mit Substanz; Presseanfrage-Dienste; Podcast- und Vortragsauftritte;
Erwähnungen ohne Link (die in Auswertungen zur Sichtbarkeit in KI-Antworten deutlich stärker
mit Sichtbarkeit zusammenhängen als Backlinks).

`scripts/blog-engine/backlink-radar.ts` findet Domains, die auf mehrere Wettbewerber zeigen
und nicht auf uns. Das ist eine **Recherchehilfe für Ansprache durch Menschen**. Wer daraus
automatisiert Links erzeugt, verstößt gegen die zitierte Regel.

---

## Der Not-Aus

Vorher festlegen, nicht im Ernstfall überlegen:

1. **Wöchentlich** in der Search Console unter „Manuelle Maßnahmen" nachsehen. Das ist die
   einzige Stelle, an der eine Sanktion angekündigt wird.
2. **Monatlich** die Sichtbarkeit der Nicht-Blog-Seiten prüfen. Fällt `/leistungen` oder die
   Suche nach dem Firmennamen, ist es kein Blogproblem mehr.
3. **Vierteljährlich** aufräumen: Was nach sechs Monaten keine Impressionen und kein
   Engagement hat, wird entfernt oder auf `noindex` gesetzt. Ballast sammelt sich sonst an
   und zählt gegen die Website als Ganzes.
4. **Im Ernstfall gilt Googles eigener Ausweg:** *„If you're hosting such content on your
   site, exclude it from Search."* Also `noindex` oder löschen — nicht nachbessern und hoffen.
   Der Umbau auf `status: "zurueckgezogen"` im Datenmodell ist genau dafür da.
5. **Ausdrücklich nicht:** auf eine zweite Domain ausweichen. Das ist wörtlich ein
   Richtlinienbeispiel („Creating multiple sites with the intent of hiding the scaled nature
   of the content") und wird zusätzlich als Umgehung behandelt, was zu breiteren Maßnahmen
   führt.

---

## Die kurze Antwort auf „wie viele pro Tag?"

Es gibt keine Zahl, die man verteidigen kann — Google nennt bewusst keine, und niemand
sonst hat Daten dafür.

Was sich verteidigen lässt, ist eine Kopplung: **veröffentlicht wird, wenn es etwas gibt.**
Der Themen-Vorrat mit Substanz ist der Taktgeber, nicht der Kalender. Sind an einem Tag drei
Themen mit belegtem Eigenanteil fertig, erscheinen drei. Ist keines fertig, erscheint keines.

Genau das ist der Unterschied zwischen dieser Automatik und den Fällen, die in der Tabelle
oben stehen.
