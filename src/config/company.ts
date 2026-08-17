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

  /** Festnetz der Firma. */
  phone: {
    display: "+49 (0) 511 89738590",
    href: "tel:+4951189738590",
  },
  /** Ayhams Mobilnummer — nur dort, wo bewusst der direkte Draht gemeint ist. */
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
