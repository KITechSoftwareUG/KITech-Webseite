/**
 * Firmen- und Kontaktdaten an einer Stelle.
 *
 * Vorher standen Telefonnummer, E-Mail und Adresse verstreut in Header, Footer,
 * Kontaktseite, Impressum und den Conversion-Bausteinen — mit zwei verschiedenen
 * Telefonnummern nebeneinander. Wer eine Nummer ändert, soll genau eine Datei
 * anfassen müssen.
 *
 * `tel:`-Links brauchen die Nummer ohne Leerzeichen, angezeigt wird die lesbare
 * Schreibweise. Deshalb steht jede Nummer doppelt da — das ist Absicht, kein
 * Duplikat.
 */

export const company = {
  /**
   * Die vollständige Firmierung. **Sichtbar nur noch in den Rechtstexten**
   * (Ansage 17.08.2026: „Mach überall aus ‚KITech Software UG
   * (haftungsbeschränkt)' nur: KITech Software — außer im Impressum.").
   *
   * Im JSON-LD steht sie weiterhin, aber im dafür vorgesehenen Feld
   * `legalName`, nicht als `name` — so heißt die Marke kurz und die
   * Anbieterkennzeichnung bleibt maschinenlesbar hinterlegt.
   *
   * Für alles Sichtbare: `shortName`.
   */
  legalName: "KITech Software UG (haftungsbeschränkt)",
  shortName: "KITech Software",
  /** Ein Satz, der die Firma beschreibt. Wird im Footer und in Schemas genutzt. */
  tagline: "Automatisierungen und individuelle Softwarelösungen für den deutschen Mittelstand.",

  address: {
    street: "Wedekindstraße 14",
    zip: "30161",
    city: "Hannover",
    country: "Deutschland",
  },

  /**
   * Die Firmennummer — **eine** Nummer, überall dieselbe.
   *
   * **Warum das umgestellt wurde (26.08.2026).** Bis dahin führte die Website
   * zwei Nummern parallel, und zwar genau auf den Flächen, die für den
   * NAP-Abgleich gelesen werden: Fußzeile und `llms.txt` zeigten das Festnetz
   * (+49 511 89738590), Impressum, Datenschutzerklärung und alle drei
   * JSON-LD-Knoten die Mobilnummer. Auf `/kontakt` standen beide auf derselben
   * Seite — die maschinenlesbare Angabe widersprach der sichtbaren.
   *
   * Für die lokale Suche zählt Übereinstimmung von Name, Anschrift und
   * Telefonnummer über Website, Google Business Profile und Verzeichnisse
   * hinweg. Zwei Nummern heißen: keine davon bestätigt die andere.
   *
   * Auf Ansage von Ayham ist die Mobilnummer die kanonische Firmennummer —
   * sie steht auch im Google Business Profile.
   *
   * ⚠️ Wer hier etwas ändert, ändert es zugleich im Google Business Profile.
   * Eine Nummer, die nur an einer der beiden Stellen wechselt, ist schlechter
   * als die alte.
   */
  phone: {
    display: "+49 151 64682544",
    href: "tel:+4915164682544",
  },
  /**
   * Dieselbe Nummer unter ihrem alten Namen.
   *
   * `mobile` wurde an Stellen verwendet, die bewusst „den direkten Draht zu
   * Ayham" meinten — StickyMobileCTA, ExitIntentPopup, der Block „Direkt zu
   * Ayham" auf /kontakt. Seit die Firmennummer dieselbe ist, zeigen beide auf
   * denselben Anschluss; das Feld bleibt, damit an diesen Stellen die Absicht
   * im Code lesbar bleibt.
   */
  mobile: {
    display: "+49 151 64682544",
    href: "tel:+4915164682544",
  },

  email: {
    general: "info@kitech-software.de",
    founder: "aalkh@kitech-software.de",
  },

  /** Wann jemand rangeht. Steht auf der Kontaktseite. */
  availability: "Mo–Fr, 9–18 Uhr",

  founder: {
    name: "Ayham Alkhalil",
    role: "Gründer & Geschäftsführer",
    linkedinUrl: "https://www.linkedin.com/in/ayham-alkhalil-66bb451b5",
  },

  registry: {
    court: "Amtsgericht Hannover",
    number: "HRB 230077",
    vatId: "DE459778632",
  },
} as const;

/** Adresse einzeilig, z. B. für Footer und Schemas. */
export const addressLine = `${company.address.street}, ${company.address.zip} ${company.address.city}`;
