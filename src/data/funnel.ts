/**
 * Inhalt der LinkedIn-Landingpage `/funnel` (Domain `funnel.kitech-software.de`,
 * Host-Rewrite in `src/proxy.ts`).
 *
 * **Was die Seite bewirbt (Vorgabe 12.08.2026):** einen kostenlosen Live-Workshop
 * mit festem Termin. Aufhänger ist die Umkehrung — nicht „wie du mit KI mehr
 * Umsatz machst", sondern *warum du es bisher nicht tust*. Zielgruppe sind
 * Geschäftsführer und Entscheider im Mittelstand, nicht Selbstständige.
 *
 * **Struktur folgt einer Vorlage**, die Ayham vorgegeben hat
 * (`src/assets/funnels.leadersmedia.de_scale_ (1).png`): Hero → Beweis →
 * Problem → CTA → Ablauf → Kosten → Ergebnis → Beweis → Qualifizierung → CTA →
 * Gründer → FAQ → Abschluss-CTA. Der gleiche CTA wiederholt sich; das ist in der
 * Vorlage so und Absicht. Übernommen wurde die *Reihenfolge*, nicht das
 * Aussehen — Farben, Typografie und Knöpfe kommen aus dem Designsystem.
 *
 * Erzählerisch ist das Schema A („Verbrannt-Funnel") aus dem
 * `funnel-narrativ`-Skill.
 *
 * ---------------------------------------------------------------------------
 * **Überarbeitung 18.08.2026 — auf Ansage „bau den bestmöglichen Funnel".**
 * Fünf Agenten haben die Seite unabhängig geprüft (Verkaufstext, Dramaturgie,
 * visuelle Wirkung, Technik, Beweisführung). Was daraus umgesetzt wurde:
 *
 *   - **Jede Aussage, die ein Wettbewerber auch unterschreiben könnte, ist
 *     ersetzt.** „Die meisten Betriebe …" war die häufigste Formulierung auf der
 *     Seite und zugleich eine unbelegte Mengenangabe (`voice.md` Regel 4).
 *   - **Die Doppelung ist raus.** `recognize` wiederholte vier der fünf
 *     `painPoints` fast wortgleich — rund 1.100 px Seitenlänge für dieselbe
 *     Diagnose. Der Abschnitt trägt jetzt die Kostenrechnung.
 *   - **Der Ablauf ist neu.** Die Seite bat um zwei Stunden Lebenszeit, ohne zu
 *     sagen, was darin passiert. Dieselben fünf Punkte, aber als Agenda gerahmt.
 *   - **Der Beweis führt jetzt mit Zahlen.** Erster Beleg nach dem Hero waren
 *     zwei zahlenlose Zitate; die harten Kennzahlen standen 4.000 px weiter
 *     unten. `voice.md` Regel 1: ein Testimonial ohne Zahl ist Dekoration.
 * ---------------------------------------------------------------------------
 *
 * ⚠️ **Was weiterhin fehlt** — solange es fehlt, bleibt die Seite auf `noindex`
 * (siehe `src/app/funnel/page.tsx`):
 *
 *   1. `termin` steht auf `null` — es gibt noch kein Datum. Der Termin- und
 *      Countdown-Block erscheint erst, wenn hier eines steht. Ohne Datum einen
 *      Countdown zu zeigen wäre eine erfundene Frist; das verbietet
 *      `funnel-narrativ/reference/bans.md` ausdrücklich. **Die Texte sind
 *      deshalb so formuliert, dass sie auch ohne Datum stimmen** — es steht
 *      nirgends „nächsten Dienstag" oder „nur noch heute".
 *   2. `anmeldung.href` zeigt auf `/lass-uns-reden` — der Kalender des
 *      1:1-KI-Checks, kein Workshop-Anmeldeformular. Wer sich für den Workshop
 *      anmeldet, landet in einem Einzelgespräch. Die FAQ „Wie melde ich mich
 *      an?" sagt das offen, damit das Versprechen beim Klick nicht bricht —
 *      besser wäre ein eigener Weg.
 *   3. Plattform und Teilnehmerzahl des Workshops sind unbekannt. Beides sind
 *      Tatsachen, keine Formulierungen: Ayham muss sie liefern, dann gehören
 *      sie in `ablaufLead` und in die FAQ.
 *   4. **Der Einblick fehlt — und damit der Funnel-Grundsatz.** Ansage vom
 *      19.08.2026: ein Funnel muss tiefe Einblicke in echte Lösungsarbeit
 *      geben, bevorzugt als Video, in dem ein konkretes Problem sichtbar
 *      gelöst wird. Diese Seite bewirbt einen Live-Workshop — der Einblick
 *      entsteht also erst *nach* der Anmeldung, davor stehen nur Kennzahlen
 *      und zwei Zitate. Die Regel und ihre Grenzen stehen in
 *      `.claude/skills/funnel-narrativ/reference/substanz.md`.
 *
 *      Was gebraucht wird: ein bis drei kurze Videos (Bildschirmaufnahme,
 *      ungeschnitten genug, dass man die Sackgassen sieht), in denen ein
 *      echtes Problem gelöst wird — z. B. die Zerlegung eines der Projekte
 *      aus `client-results.ts`. Vor der Aufnahme: Testdaten statt echter
 *      Kundendatensätze, keine Zugangsdaten im Bild, schriftliche Freigabe
 *      des Kunden. Risikofrei ohne Rückfrage geht es mit `klargehalt.de` —
 *      das ist ein eigenes Produkt.
 *
 *      Der Block gehört zwischen Hero und Problem, dorthin, wo heute die
 *      Zahlentafel steht: Beweis vor der ersten Behauptung. Die Zahlentafel
 *      rückt dann darunter und darf kürzer werden.
 *
 * **Alle Zahlen auf dieser Seite müssen belegt sein.** Die Kennzahlen in
 * `beweisZeilen` sind wörtlich aus `src/data/client-results.ts` übernommen, die
 * Zitate kommen aus `src/data/testimonials.ts`. Hier nichts eintragen, was dort
 * nicht steht (§ 5b Abs. 3 UWG).
 */

/** Ein fester Workshop-Termin. `null`, solange keiner feststeht. */
export interface FunnelTermin {
  /**
   * Startzeitpunkt als ISO-8601-String **mit Zeitzonen-Angabe**, z. B.
   * `"2026-09-16T10:00:00+02:00"`. Die Zone gehört dazu: ohne sie rechnet der
   * Server in UTC und der Browser in Ortszeit, und der Countdown springt beim
   * Laden um zwei Stunden.
   */
  start: string;
  /** Wie der Termin dasteht, ausgeschrieben — z. B. „Dienstag, 16. September, 10 Uhr". */
  anzeige: string;
  /** Wann die Anmeldung schließt, ausgeschrieben. Leer lassen, wenn es keine Frist gibt. */
  anmeldeschluss: string | null;
}

export const funnelContent = {
  /* ---------------------------------------------------------------- Hero -- */

  /**
   * **Eine Behauptung, kein Thema.** Vorher stand hier „Warum du mit KI keinen
   * Umsatz machst." — ein Nebensatz ohne Hauptsatz, der etwas ankündigt, statt
   * etwas zu behaupten, und den jede KI-Beratung im Land über ihren Funnel
   * schreiben könnte. Jetzt steht die Diagnose selbst da, und die Schuld liegt
   * bei der Platzierung der Technik, nicht beim Leser (`voice.md` Regel 3).
   */
  headline: "Deine KI macht",
  /** Steht im blauen Marker. Der Punkt gehört hinein — die View setzt danach ein Leerzeichen. */
  headlineHighlight: "keinen Umsatz.",
  headlineRest: "Sie macht nur Verwaltung.",

  /**
   * Drei Tätigkeiten, die jeder Geschäftsführer im eigenen Haus wiedererkennt,
   * dann der Verlustsatz. Keine Mengenangabe, keine dritte Person, kein
   * „kann/oft/meistens". Geht als `description` in das JSON-LD der Seite.
   */
  lead: "Ihr schreibt Angebote schneller, fasst Protokolle zusammen, beantwortet Mails in der halben Zeit. Nichts davon steht am Monatsende auf einer Rechnung.",

  zielgruppe: "Kostenloser Live-Workshop für Geschäftsführer und Entscheider im Mittelstand.",

  /**
   * Die drei Angaben, die vor dem Klick entscheiden. Sie standen bis zum
   * 18.08.2026 nur als 12-px-Zeile *unter* dem Knopf — also unterhalb der
   * Stelle, an der jemand entscheidet, ob er überhaupt weiterliest. Keine neue
   * Behauptung: alle drei stehen so auch in `zielgruppe` und `anmeldung`.
   */
  eckdaten: ["Kostenlos", "2 Stunden", "Live, ohne Aufzeichnung"],

  /**
   * ⚠️ Kein Termin eingetragen — Terminzeile, Anmeldeschluss und Countdown
   * bleiben unsichtbar. Sobald hier ein Objekt steht, erscheinen alle drei von
   * selbst. Beispiel:
   *
   *     termin: {
   *       start: "2026-09-16T10:00:00+02:00",
   *       anzeige: "Dienstag, 16. September, 10 Uhr",
   *       anmeldeschluss: "Anmeldeschluss: Montag, 15. September, 22 Uhr",
   *     },
   */
  termin: null as FunnelTermin | null,

  /**
   * Der eine Knopf der Seite. Mehrfach eingebaut, überall gleich beschriftet.
   *
   * „kostenlos" statt „0 €": dasselbe Versprechen ohne den Beigeschmack eines
   * Preisschilds, das gerade nicht gilt. Der Hinweis nennt den Gegenwert statt
   * nur die Dauer — „zwei Stunden" allein ist für einen Geschäftsführer ein
   * Kostenpunkt, kein Argument.
   */
  anmeldung: {
    label: "Platz sichern — kostenlos",
    hinweis: "2 Stunden live. Du gehst mit einer Entscheidung raus, nicht mit Notizen.",
    /** ⚠️ Siehe Punkt 2 im Kopfkommentar — noch kein eigener Anmeldeweg. */
    href: "/lass-uns-reden",
  },

  /* ------------------------------------------------------------- Beweis -- */

  /**
   * **Zahlen zuerst, Zitate danach.** Alle Angaben wörtlich aus
   * `src/data/client-results.ts` — dort sind sie mit Firma, Person und Dauer
   * hinterlegt. Hier keine Zeile ergänzen, für die es dort keinen Eintrag gibt.
   *
   * Formulierung „an eingespartem Aufwand" ist Absicht: „Vollzeitstellen
   * weniger Verwaltungsarbeit" ist laut CLAUDE.md ausdrücklich raus — belegt ist
   * eine Aufwands-Äquivalenz, kein Dauerzustand.
   */
  beweisHeading: "Was aus abgeschlossenen Projekten übrig bleibt",
  /**
   * Als Zahlentafel gesetzt, nicht als Fließtext: die Zahl ist das Argument,
   * alles andere ist Beleg dazu. Bis zum 18.08.2026 stand jede dieser Angaben
   * als eine Textzeile mit Gedankenstrich — die stärkste Munition der Seite sah
   * damit aus wie eine Rechnungsposition.
   *
   * `zahl` und `label` sind wörtlich `headline.value` / `headline.label` aus
   * `src/data/client-results.ts`, `dauer` kommt aus den dortigen `metrics`.
   * Hier keine Zeile ergänzen, für die es dort keinen Eintrag gibt.
   */
  beweis: [
    {
      zahl: "1,5",
      label: "Vollzeitstellen an eingespartem Aufwand",
      firma: "NiImmo Wohnungsbaugesellschaft",
      dauer: "40 Tage bis live",
    },
    {
      zahl: "1,2",
      label: "Vollzeitkräfte an eingespartem Aufwand",
      firma: "cert consulting Pane",
      dauer: "60 Tage bis live",
    },
    {
      zahl: "10 Min.",
      label: "für eine Kundenrecherche, die vorher Handarbeit war",
      firma: "Grynia Consulting",
      dauer: null,
    },
    {
      zahl: "2 Monate",
      label: "von der ersten Zeile bis zum Livegang",
      firma: "klargehalt.de",
      dauer: null,
    },
  ],
  /**
   * Der ungenutzte Beweis: keiner dieser Wege hat länger als zwei Monate
   * gedauert. Das steht in keinem einzelnen Fall, ergibt sich aber aus allen —
   * und ist für einen Geschäftsführer die Angst, die zuerst kommt.
   */
  beweisSchluss: "Kein Projekt davon hat länger als zwei Monate gebraucht.",

  /* ------------------------------------------------- Pattern-Interrupt ---- */

  /**
   * ⚠️ WORTLAUT PRÜFEN (Ayham): Der Absatz steht in der Ich-Form und gehört
   * damit dir. Er kommt bewusst ohne Jahreszahl, Kundenname oder Projektdetail
   * aus — eine erfundene Episode gehört hier nicht hin. Die konkrete Geschichte
   * ersetzt diesen Text.
   */
  patternInterrupt: {
    heading: "Ich habe das selbst falsch gemacht.",
    body: "Ich habe KI zuerst da eingesetzt, wo es am leichtesten ging: bei allem, was geschrieben werden musste. Es funktionierte, es sparte Zeit, es fühlte sich richtig an. Nur wurde daraus kein einziger Auftrag mehr. Gebracht hat es erst etwas, als ich aufgehört habe zu fragen, was sich automatisieren lässt, und angefangen habe zu fragen, an welcher Stelle bei uns Geld liegen bleibt.",
  },

  /* ------------------------------------------------------------ Problem -- */

  /**
   * Die Erfahrung steht als Beobachtung da („wenn ein Geschäftsführer bei uns
   * anruft"), nicht als Statistik, die niemand belegen kann. Vorher stand hier
   * dreimal „die meisten" und einmal „fast nie".
   */
  painHeading: "KI läuft bei euch. Der Umsatz merkt davon nichts.",
  painIntro:
    "Es fehlt nicht an Technik. Wenn ein Geschäftsführer bei uns anruft, läuft im Haus längst irgendwo ein Sprachmodell.",
  painLeadIn: "Was wir dort vorfinden:",
  /**
   * Jede Zeile ist im eigenen Haus nachprüfbar, keine im Konjunktiv. Punkt 3
   * und 5 sind zweisätzig — die zweite Hälfte ist jeweils die Pointe.
   */
  painPoints: [
    "Ein ChatGPT-Abo fürs Team, das an keinem einzigen eurer Systeme hängt",
    "Eine KI, die eure Preise, eure Kunden und eure Angebote nicht kennt",
    "Zwei, drei Leute, die etwas ausprobieren. Fällt einer aus, fällt es aus.",
    "Keine Zahl im Controlling, in der das Ganze überhaupt auftaucht",
    "Jede Automatisierung sitzt in der Verwaltung. Keine im Vertrieb.",
  ],
  painConclusion: "Genau deshalb bleibt der Umsatz, wo er vorher war.",
  painBridge: "Im Workshop gehen wir jeden dieser fünf Punkte an deinem Betrieb durch.",

  /* ------------------------------------------------------------- Ablauf -- */

  /**
   * **Agenda-Beat.** Dieselben fünf Punkte, die hier bis zum 18.08.2026 als
   * „Mechanismus" standen — nur als Ablauf gerahmt statt als
   * Methodenversprechen. Wer zwei Stunden Lebenszeit hergibt, will vorher
   * wissen, wofür.
   *
   * ⚠️ Plattform und Teilnehmerzahl fehlen (siehe Punkt 3 im Kopfkommentar).
   * Sobald sie feststehen, gehören sie in `ablaufLead`.
   */
  ablaufHeading: "So laufen die zwei Stunden",
  ablaufLead:
    "Fünf Blöcke — die fünf Stellen, an denen aus KI Umsatz wird. Nach jedem entscheidest du für deinen Betrieb, nicht für ein Beispiel.",
  ablauf: [
    {
      title: "Das Angebot",
      description: "Wo KI deine Leistung wertvoller macht — nicht nur billiger in der Herstellung.",
    },
    {
      title: "Der Zugriff",
      description: "Warum eine KI ohne eure Daten und Systeme ein besserer Suchassistent bleibt.",
    },
    {
      title: "Der Ablauf",
      description: "Wie aus zwei, drei Leuten ein Prozess wird, der auch ohne sie weiterläuft.",
    },
    {
      title: "Der Vertrieb",
      description: "An welcher Stelle im Verkauf die Stunden liegen, die dir KI zurückgibt.",
    },
    {
      title: "Die Zahl",
      description: "Woran du misst, ob es sich rechnet. Vor dem Projekt, nicht ein Jahr danach.",
    },
  ],

  /* -------------------------------------------------- Kosten / Ergebnis -- */

  /**
   * **Umgewidmet am 18.08.2026.** Vorher stand hier „Vielleicht erkennst du
   * dich hier wieder" mit fünf Zeilen, von denen vier die `painPoints`
   * paraphrasierten — dieselbe Diagnose ein zweites Mal, rund 1.100 px lang.
   * Jetzt steht hier, was das Nichtstun kostet: keine erfundene Zahl, aber
   * jede Zeile kann der Leser mit seinen eigenen Zahlen nachrechnen.
   */
  kostenHeading: "Was es kostet, wenn es so bleibt",
  kosten: [
    "Du zahlst Lizenzen für Werkzeuge, die in keinem Angebot und auf keiner Rechnung auftauchen.",
    "Die Verwaltung ist schneller geworden. Der Vertrieb arbeitet im Tempo von vor zwei Jahren.",
    "Jeder neue Anlauf fängt bei null an, weil niemand festgehalten hat, woran der letzte gescheitert ist.",
    "Deine Leute sagen dir nicht, dass es nicht funktioniert. Sie hören einfach auf, es zu benutzen.",
    "Irgendwann kalkuliert ein Wettbewerber deiner Größe schärfer als du — und du erfährst es über den Preis, nicht über die Technik.",
  ],

  changeHeading: "Womit du am Abend rausgehst",
  change: [
    "Die eine Stelle in deinem Betrieb, an der KI Umsatz berührt — benannt, nicht vermutet.",
    "Einen Anwendungsfall, für den du dich entschieden hast. Und vier, die du bewusst verworfen hast.",
    "Die Zahl, an der du in drei Monaten abliest, ob es funktioniert hat.",
    "Eine Begründung, die du deinem Team in zwei Sätzen erklären kannst.",
    "Die Trennlinie zwischen dem, was ihr selbst macht, und dem, wofür ihr jemanden braucht.",
  ],

  /* ------------------------------------------------------ Qualifizierung -- */

  fit: {
    forTitle: "Dieser Workshop ist für dich, wenn …",
    for: [
      "du einen Betrieb ab etwa zehn Mitarbeitern führst",
      "bei euch schon irgendwo KI läuft, ohne dass es jemand messen kann",
      "du über Budget und Prioritäten entscheidest",
      "du wissen willst, wo sich der Einsatz zuerst rechnet",
      "du bereit bist, vier Ideen zu verwerfen, um eine umzusetzen",
    ],
    notTitle: "Dieser Workshop ist NICHT für dich, wenn …",
    not: [
      "du eine Liste mit Prompts suchst",
      "du eine allgemeine Einführung in KI erwartest",
      "du im Betrieb nichts entscheiden oder anstoßen kannst",
      "du erwartest, dass sich ohne eigene Umsetzung etwas ändert",
      "du ein fertiges Werkzeug kaufen willst, ohne zu wissen wofür",
    ],
  },

  /* ------------------------------------------------------------ Gründer -- */

  /**
   * Der letzte Absatz endete bis zum 18.08.2026 bei der Entstehungsgeschichte
   * des Workshops — also beim Absender. Jetzt endet er beim Leser.
   */
  founder: {
    heading: "Moin, ich bin Ayham. Gründer von KITech Software.",
    paragraphs: [
      "Wir haben über 50 Projekte abgeschlossen — vom ersten Gespräch bis zur Software, die im Tagesgeschäft läuft.",
      "Dabei ist mir eines immer wieder begegnet: Es fehlt nicht am Wissen über KI.",
      "Es fehlt an der Entscheidung, wo im eigenen Haus überhaupt Geld liegen bleibt.",
      "Diese Entscheidung triffst du in den zwei Stunden. Mit deinen Zahlen, nicht mit meinen Beispielen.",
    ],
  },

  /* ---------------------------------------------------------------- FAQ -- */

  faqHeading: "Was Geschäftsführer vorher wissen wollen",
  faq: [
    {
      question: "Wie melde ich mich an?",
      /*
       * Steht bewusst an erster Stelle und sagt offen, was passiert: der Knopf
       * führt in ein Vorgespräch, nicht in ein Workshop-Formular (Punkt 2 im
       * Kopfkommentar). Solange das so ist, muss es hier stehen — sonst bricht
       * das Versprechen beim ersten Klick.
       */
      answer:
        "Über den Knopf auf dieser Seite. Wir sprechen vorab kurz miteinander — das dauert keine halbe Stunde und klärt, ob dein Fall in die Runde passt. Danach bekommst du den Termin.",
    },
    {
      question: "Ist der Workshop wirklich kostenlos?",
      answer:
        "Ja. Kein Ticket, keine Kreditkarte, keine Bedingung. Der Workshop ist unsere Art, Betriebe kennenzulernen, die danach etwas umsetzen wollen. Ein Teil beauftragt uns später. Der Rest nicht — das ist eingepreist.",
    },
    {
      question: "Muss ich mich mit KI auskennen?",
      answer:
        "Nein. Es geht um Entscheidungen, nicht um Technik. Wenn du weißt, wie in deinem Betrieb Geld verdient wird, reicht das.",
    },
    {
      question: "Ist das eine verkappte Verkaufsveranstaltung?",
      answer:
        "Am Ende der zwei Stunden sage ich dir in zwei Minuten, was wir machen. Danach ist Schluss. Die restliche Zeit gehört deinem Betrieb — und was du dabei erarbeitest, kannst du auch ohne uns umsetzen.",
    },
    {
      question: "Wird es eine Aufzeichnung geben?",
      answer:
        "Nein. Wir gehen konkrete Fälle der Teilnehmer durch, deshalb läuft keine Aufnahme mit. Wer nicht dabei war, war nicht dabei.",
    },
    {
      question: "Für welche Betriebsgröße lohnt sich das?",
      answer:
        "Ab etwa zehn Mitarbeitern. Darunter wiederholt sich zu wenig, als dass sich Automatisierung rechnet — dann ist ein Einzelgespräch der bessere Weg.",
    },
  ],

  /* -------------------------------------------------------- Abschluss --- */

  /**
   * Verlust statt Bedingung: „Wenn KI … soll, dann sichere dir …" war ein
   * Konditionalsatz, der dem Leser die Wahl leicht macht. Jetzt steht da, was
   * ohne die Entscheidung weiterläuft (`voice.md` Regel 2).
   */
  cta: {
    heading: "Nächstes Jahr läuft bei euch mehr KI. Die Frage ist, ob sie dann Umsatz macht.",
    text: "Zwei Stunden, in denen du entscheidest, wo du anfängst — und woran du misst, ob es sich gelohnt hat.",
  },
};
