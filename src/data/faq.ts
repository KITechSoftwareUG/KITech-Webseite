/**
 * Die fünf Fragen unter dem Gründerwort auf der Startseite.
 *
 * **Auf Ansage (14.08.2026)** ausgewählt: die Einwände, die im Gespräch als
 * erstes kommen — Preis, Dauer, „lohnt sich das bei uns überhaupt", Daten,
 * und was nach dem Projekt passiert.
 *
 * **Jede Antwort ist im Repo belegt** und nicht neu erfunden:
 *
 *   | Frage      | Beleg                                                    |
 *   |------------|----------------------------------------------------------|
 *   | Kosten     | `src/config/angebot.ts` (kostenlos, 30 Min), `services[0]` |
 *   | Dauer      | `src/data/client-results.ts` (40 Tage, 60 Tage, 2 Monate) |
 *   | Lohnt sich | `services[0]`, `principles` („Nicht jedes Problem …")     |
 *   | Daten      | `services[2]` (EU-Region über AWS/Azure mit AVV, eigene Hardware) |
 *   | Danach     | `services[3]`, `commitments` (Code gehört euch, Wartung)  |
 *
 * ⚠️ **Keine Preise erfinden.** Zu Projektpreisen liegt im Repo keine Zahl vor,
 * deshalb steht in der Antwort auch keine. Wer hier einen Betrag einträgt, muss
 * ihn halten können — eine Preisangabe auf der Website ist eine Zusage.
 *
 * Die Fragen gehen zusätzlich als `FAQPage`-Schema an Google (siehe
 * `getFAQSchema` in `src/components/seo/StructuredData.tsx`). Deshalb gilt:
 * **Antworten hier müssen wortgleich auf der Seite stehen** — Google verlangt,
 * dass ausgezeichneter Inhalt sichtbar ist. Genau deshalb speist eine Quelle
 * beides.
 */

export interface FaqEintrag {
  frage: string;
  antwort: string;
}

export const faq: FaqEintrag[] = [
  {
    frage: "Was kostet das?",
    antwort:
      "Der 1:1-KI-Check kostet nichts — eine halbe Stunde, ohne Bedingung dahinter. Für ein Projekt nennen wir den Preis, wenn wir wissen, was gebaut werden soll: nach dem Prozess-Audit. Vorher wäre jede Zahl geraten, und geraten habt ihr selbst genug.",
  },
  {
    frage: "Wie lange dauert es, bis etwas läuft?",
    antwort:
      "Wochen, keine Quartale. Das Kundenportal bei cert consulting war nach 60 Tagen live, das Portal der NiImmo-Gruppe nach 40, eine komplette SaaS-Anwendung nach zwei Monaten von der ersten Zeile bis zum Livegang.",
  },
  {
    frage: "Was, wenn sich KI bei uns gar nicht lohnt?",
    antwort:
      "Dann sagen wir das. Wir sehen uns im ersten Schritt eure Abläufe an und benennen, an welcher Stelle Automatisierung etwas bringt — und an welcher nicht. Wenn eine einfachere Lösung besser passt, empfehlen wir sie, auch wenn wir daran weniger verdienen.",
  },
  {
    frage: "Was passiert mit unseren Daten?",
    antwort:
      "Was ihr wollt. Betrieb in europäischer Region über AWS oder Azure mit Auftragsverarbeitungsvertrag — oder auf eurer eigenen Hardware, wenn die Daten das Haus nicht verlassen dürfen. Beides bauen wir regelmäßig; die Entscheidung trefft ihr, nicht der Anbieter.",
  },
  {
    frage: "Und wenn das Projekt fertig ist?",
    antwort:
      "Der Code gehört euch, dokumentiert und wartbar. Was gebaut ist, muss laufen: Überwachung, Nachjustieren, Weiterentwicklung — mit einem festen Ansprechpartner statt einer Ticketschlange. Wissenstransfer ist Teil des Projekts, kein Zusatzposten.",
  },
];
