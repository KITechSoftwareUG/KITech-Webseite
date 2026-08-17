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
 * **Gekürzt am 17.08.2026, auf Ansage:** „Auch die FAQs sind ein bisschen zu
 * lang. Die Texte wirklich einfach, so einfach wie es geht." Jede Antwort steht
 * jetzt in ein bis zwei Sätzen (vorher drei bis vier), zusammen rund 90 statt
 * 190 Wörter. Gestrichen wurde nur Ausschmückung, kein Beleg: die Zahlen, die
 * EU-Region samt Auftragsverarbeitungsvertrag und „der Code gehört euch" stehen
 * unverändert drin. Zwei Fragen sind selbst kürzer geworden („Wie lange dauert
 * es?" statt „… bis etwas läuft?").
 *
 * **Die Länge ist Teil der Sache.** Wer eine Antwort ergänzt, ergänzt einen
 * Satz — keinen Absatz. Eine FAQ, die man lesen muss, beantwortet nichts.
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
      "Der 1:1-KI-Check kostet nichts. Den Preis fürs Projekt nennen wir nach dem Prozess-Audit — vorher wäre jede Zahl geraten.",
  },
  {
    frage: "Wie lange dauert es?",
    antwort:
      "Wochen, keine Quartale. Das NiImmo-Portal war nach 40 Tagen live, cert consulting nach 60, eine komplette SaaS-Anwendung nach zwei Monaten.",
  },
  {
    frage: "Was, wenn sich KI bei uns nicht lohnt?",
    antwort:
      "Dann sagen wir das. Passt eine einfachere Lösung besser, empfehlen wir sie — auch wenn wir daran weniger verdienen.",
  },
  {
    frage: "Was passiert mit unseren Daten?",
    antwort:
      "Was ihr wollt: europäische Region mit Auftragsverarbeitungsvertrag oder eure eigene Hardware. Ihr entscheidet, nicht der Anbieter.",
  },
  {
    frage: "Und wenn das Projekt fertig ist?",
    antwort:
      "Der Code gehört euch, dokumentiert und wartbar. Betrieb und Weiterentwicklung laufen über einen festen Ansprechpartner.",
  },
];
