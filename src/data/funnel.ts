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
 * (`src/assets/funnels.leadersmedia.de_scale_ (1).png`): Hero mit Termin →
 * Beweis → Problem → CTA → Mechanismus → Wiedererkennung → Vorher/Nachher →
 * Beweis → Qualifizierung → CTA → Gründer → Logos → FAQ → Abschluss-CTA. Der
 * gleiche CTA wiederholt sich vier Mal; das ist in der Vorlage so und Absicht.
 * Übernommen wurde die *Reihenfolge*, nicht das Aussehen — Farben, Typografie
 * und Knöpfe kommen aus dem Designsystem dieser Website.
 *
 * Erzählerisch ist das weiter Schema A („Verbrannt-Funnel") aus dem
 * `funnel-narrativ`-Skill: Bold-Headline → Pattern-Interrupt → Problem →
 * Kundenstimmen → These → Mechanismus → CTA. Die Vorlage schiebt nur
 * Qualifizierung, Gründer und FAQ dazwischen.
 *
 * ⚠️ **Drei Dinge fehlen und sind bewusst als Platzhalter markiert.** Solange
 * sie offen sind, bleibt die Seite auf `noindex` (siehe `src/app/funnel/page.tsx`):
 *
 *   1. `termin` steht auf `null` — es gibt noch kein Datum. Der komplette
 *      Termin- und Countdown-Block erscheint erst, wenn hier eines steht. Ohne
 *      Datum einen Countdown zu zeigen wäre eine erfundene Frist; die verbietet
 *      `funnel-narrativ/reference/bans.md` ausdrücklich.
 *   2. `patternInterrupt.body` ist Platzhalter-Struktur, keine erfundene
 *      Biografie. Ayhams echter Wortlaut ersetzt den Text.
 *   3. `anmeldung.href` zeigt auf `/lass-uns-reden` — das ist der Kalender der
 *      kostenlosen KI-Bewertung, kein Workshop-Anmeldeformular. Wer sich für
 *      den Workshop anmeldet, landet damit in einem Einzelgespräch. Braucht
 *      entweder einen eigenen Anmeldeweg oder die Entscheidung, dass das reicht.
 *
 * Alle Zahlen auf dieser Seite müssen belegt sein. Die Kundenergebnisse kommen
 * über `KundenLaufband` aus `src/data/client-results.ts`, die Kundenstimmen aus
 * `src/data/testimonials.ts` — beide tragen nur, was tatsächlich abgegeben
 * wurde. Hier keine weiteren Zahlen eintragen, ohne sie belegen zu können
 * (§ 5b Abs. 3 UWG).
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

  headline: "Warum du mit KI",
  /** Steht im blauen Marker — die Aussage, an der die Seite hängt. */
  headlineHighlight: "keinen Umsatz",
  headlineRest: "machst.",
  lead: "Die meisten Betriebe im Mittelstand haben kein KI-Problem. Sie haben KI an einer Stelle, an der kein Umsatz entsteht.",

  /** Die zwei Zeilen unter dem Lead. In der Vorlage stehen sie mit Emoji davor. */
  zielgruppe: "Kostenloser Live-Workshop für Geschäftsführer und Entscheider im Mittelstand.",

  /**
   * ⚠️ Kein Termin eingetragen — Hero-Terminzeile, Anmeldeschluss und Countdown
   * bleiben deshalb unsichtbar. Sobald hier ein Objekt steht, erscheinen alle
   * drei von selbst. Beispiel:
   *
   *     termin: {
   *       start: "2026-09-16T10:00:00+02:00",
   *       anzeige: "Dienstag, 16. September, 10 Uhr",
   *       anmeldeschluss: "Anmeldeschluss: Montag, 15. September, 22 Uhr",
   *     },
   */
  termin: null as FunnelTermin | null,

  /** Der eine Knopf der Seite. Vier Mal eingebaut, überall gleich beschriftet. */
  anmeldung: {
    label: "Platz sichern — 0 €",
    /** Zweite Zeile im Knopf. Nennt die Dauer, damit der Aufwand vor dem Klick klar ist. */
    hinweis: "2 Stunden, live, ohne Aufzeichnung",
    /** ⚠️ Siehe Punkt 3 im Kopfkommentar — noch kein eigener Anmeldeweg. */
    href: "/lass-uns-reden",
  },

  /* ------------------------------------------------- Pattern-Interrupt ---- */

  /**
   * ⚠️ WORTLAUT PRÜFEN (Ayham): Der Absatz steht in der Ich-Form und gehört
   * damit dir. Er ist am 12.08.2026 geschrieben worden, weil hier vorher eine
   * Regieanweisung stand ("Platzhalter: eine kurze, persönliche Geschichte …"),
   * die jeder Besucher lesen konnte. Er kommt bewusst ohne Jahreszahl, Kundenname
   * oder Projektdetail aus — eine erfundene Episode gehört hier nicht hin. Die
   * konkrete Geschichte ersetzt diesen Text.
   */
  patternInterrupt: {
    heading: "Ich habe das selbst falsch gemacht.",
    body: "Ich habe KI zuerst da eingesetzt, wo es am leichtesten ging: bei allem, was geschrieben werden musste. Es funktionierte, es sparte Zeit, es fühlte sich richtig an. Nur wurde daraus kein einziger Auftrag mehr. Gebracht hat es erst etwas, als ich aufgehört habe zu fragen, was sich automatisieren lässt, und angefangen habe zu fragen, an welcher Stelle bei uns Geld liegen bleibt.",
  },

  /* ------------------------------------------------------------ Problem -- */

  painHeading: "Warum die meisten trotz KI keinen Euro mehr verdienen.",
  painIntro: "Die Betriebe, die bei uns anrufen, haben fast nie zu wenig KI im Haus.",
  painLeadIn: "Sie haben:",
  painPoints: [
    "Werkzeuge, die niemand ans Tagesgeschäft angeschlossen hat",
    "KI ohne Zugriff auf die eigenen Daten und Systeme",
    "Einzelne Mitarbeiter, die etwas ausprobieren — ohne festen Ablauf",
    "Keine Zahl, an der jemand ablesen könnte, ob sich das rechnet",
    "KI in der Verwaltung statt dort, wo verkauft wird",
  ],
  painConclusion: "Genau deshalb bleibt der Umsatz, wo er vorher war.",
  painBridge: "Im Workshop gehen wir jeden dieser fünf Punkte einzeln durch.",

  /* -------------------------------------------------------- Mechanismus -- */

  mechanismHeading: "Die 5 Stellen, an denen aus KI Umsatz wird",
  mechanism: [
    {
      title: "Das Angebot",
      description: "Wo KI deine Leistung wertvoller macht — nicht nur billiger in der Herstellung.",
    },
    {
      title: "Der Zugriff",
      description: "Warum KI ohne deine Daten und Systeme ein besserer Suchassistent bleibt.",
    },
    {
      title: "Der Ablauf",
      description: "Wie aus einzelnen Nutzern ein Prozess wird, der auch ohne dich weiterläuft.",
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

  /* --------------------------------------------- Wiedererkennung / Ziel -- */

  recognizeHeading: "Vielleicht erkennst du dich hier wieder:",
  recognize: [
    "In deinem Betrieb nutzen einzelne Leute KI, aber niemand kann sagen, was es bringt.",
    "Ihr habt Werkzeuge eingekauft, die nach ein paar Wochen keiner mehr öffnet.",
    "Die KI kennt eure Preise, Kunden und Abläufe nicht — jede Anfrage fängt bei null an.",
    "Du weißt, dass da etwas geht, aber nicht, wo ihr anfangen sollt.",
    "Alles, was ihr bisher automatisiert habt, sitzt in der Verwaltung, nicht im Verkauf.",
  ],

  changeHeading: "Das verändert sich nach dem Workshop:",
  change: [
    "Du weißt, an welcher Stelle in deinem Betrieb KI überhaupt Umsatz berühren kann.",
    "Du hast einen Anwendungsfall ausgewählt — und die vier anderen bewusst verworfen.",
    "Du kennst die Zahl, an der du in drei Monaten ablesen kannst, ob es funktioniert hat.",
    "Du kannst deinem Team erklären, warum dieser Fall und nicht ein anderer.",
    "Du weißt, was du selbst bauen lassen kannst und wofür du jemanden brauchst.",
  ],

  /* ------------------------------------------------------ Qualifizierung -- */

  fit: {
    forTitle: "Dieser Workshop ist für dich, wenn …",
    for: [
      "du einen Betrieb mit mehreren Mitarbeitern führst",
      "ihr KI schon irgendwo einsetzt, aber ohne messbaren Effekt",
      "du Entscheidungen über Budget und Prioritäten triffst",
      "du wissen willst, wo sich der Einsatz zuerst lohnt",
      "du bereit bist, vier Ideen zu verwerfen, um eine umzusetzen",
    ],
    notTitle: "Dieser Workshop ist NICHT für dich, wenn …",
    not: [
      "du eine Liste mit Prompts suchst",
      "du dir eine allgemeine Einführung in KI erhoffst",
      "du im Betrieb nichts entscheiden oder anstoßen kannst",
      "du erwartest, dass sich ohne eigene Umsetzung etwas ändert",
      "du ein fertiges Werkzeug kaufen willst statt zu verstehen, wofür",
    ],
  },

  /* ------------------------------------------------------------ Gründer -- */

  founder: {
    heading: "Moin, ich bin Ayham. Gründer von KITech Software.",
    paragraphs: [
      "Wir haben über 50 Projekte abgeschlossen — vom ersten Gespräch bis zur Software, die im Tagesgeschäft läuft.",
      "Dabei ist uns eines immer wieder begegnet: Die meisten Betriebe haben kein Wissensproblem.",
      "Sie haben ein Problem damit, zu entscheiden, wo KI im eigenen Haus überhaupt Geld berührt.",
      "Genau daraus ist dieser Workshop entstanden.",
    ],
  },

  /* ---------------------------------------------------------------- FAQ -- */

  faqHeading: "Fragen? Hier kommen die Antworten",
  faq: [
    {
      question: "Ist der Workshop wirklich kostenlos?",
      answer:
        "Ja. Es gibt kein Ticket, keine Zahlung und keine Bedingung dahinter. Wir arbeiten mit Betrieben zusammen, die anschließend etwas umsetzen wollen — dafür müssen wir uns vorher kennengelernt haben.",
    },
    {
      question: "Muss ich mich mit KI auskennen?",
      answer:
        "Nein. Es geht um Entscheidungen, nicht um Technik. Wenn du weißt, wie in deinem Betrieb Geld verdient wird, reicht das.",
    },
    {
      question: "Ist das eine verkappte Verkaufsveranstaltung?",
      answer:
        "Es ist ein Workshop mit einem Ergebnis, das du auch ohne uns umsetzen kannst. Wer danach Hilfe bei der Umsetzung will, bekommt sie — wer nicht, behält trotzdem den Plan.",
    },
    {
      question: "Wird es eine Aufzeichnung geben?",
      answer:
        "Nein. Wir gehen im Workshop konkrete Fälle der Teilnehmer durch, deshalb läuft keine Aufnahme mit. Wer nicht dabei ist, verpasst den Termin.",
    },
    {
      question: "Für welche Betriebsgröße lohnt sich das?",
      answer:
        "Ab dem Punkt, an dem mehrere Menschen an denselben Abläufen arbeiten — in der Praxis etwa ab zehn Mitarbeitern. Darunter ist meist noch keine Stelle da, an der sich Automatisierung rechnet.",
    },
  ],

  /* -------------------------------------------------------- Abschluss --- */

  cta: {
    heading: "Wenn KI in deinem Betrieb endlich Umsatz berühren soll, dann sichere dir jetzt deinen Platz.",
    text: "Zwei Stunden, in denen du entscheidest, wo du anfängst — und woran du misst, ob es sich gelohnt hat.",
  },
};
