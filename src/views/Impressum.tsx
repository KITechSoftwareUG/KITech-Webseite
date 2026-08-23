import { PageShell } from "@/components/layout/PageShell";
import { TEXT_CONTAINER } from "@/components/layout/site-container";
import { StructuredData, getWebPageSchema, getBreadcrumbSchema, getFounderPersonSchema } from "@/components/seo/StructuredData";

/**
 * Anbieterkennzeichnung. Die Angaben stehen hier bewusst woertlich im Text und
 * nicht aus `src/config/company.ts` — ein Rechtstext soll sich nicht aendern,
 * weil jemand eine Konstante anfasst.
 *
 * **Rechtsnorm: § 5 DDG, nicht § 5 TMG** (korrigiert am 23.08.2026). Das
 * Telemediengesetz ist am 14.05.2024 durch das Digitale-Dienste-Gesetz abgeloest
 * worden; die Impressumspflicht steht seither in § 5 DDG. Die Ueberschrift trug
 * bis dahin die aufgehobene Norm — derselbe Fehler, der am 21.08.2026 in
 * `llms.txt` gefunden und dort per Test abgesichert wurde. Der Test in
 * `src/lib/__tests__/rechtstexte.test.ts` deckt jetzt auch diese Seite ab.
 *
 * **Vertretungsberechtigte:** § 5 Abs. 1 Nr. 1 DDG verlangt *alle*
 * Vertretungsberechtigten. Hier steht seit dem 23.08.2026 nur noch Ayham
 * Alkhalil — auf ausdrueckliche Ansage („Leon soll ueberall raus. Er ist kein
 * Geschaeftsfuehrer!"). Wer das aendert, prueft vorher den Handelsregisterauszug
 * zu HRB 230077: steht dort eine zweite Person, gehoert sie auch hierher.
 */
export default function Impressum() {
  return (
    <PageShell backdropClassName="absolute inset-x-0 top-0 -z-10 h-[360px]">
      <StructuredData
        data={getWebPageSchema("Impressum", "Impressum der KITech Software UG", "https://kitech-software.de/impressum")}
      />
      <StructuredData
        data={getBreadcrumbSchema([
          { name: "Startseite", url: "https://kitech-software.de" },
          { name: "Impressum", url: "https://kitech-software.de/impressum" },
        ])}
      />
      <StructuredData data={getFounderPersonSchema()} />
      <section className="py-20 lg:py-28">
        <div className={TEXT_CONTAINER}>
          <h1 className="kinetic-display mb-10 text-[36px] leading-[1.1] text-foreground sm:text-[44px]">Impressum</h1>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Angaben gemäß § 5 DDG</h2>
              <p className="text-muted-foreground">
                KITech Software UG (haftungsbeschränkt)
                <br />
                Wedekindstraße 14 <br />
                30161 Hannover <br />
                Deutschland
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
              <p className="text-muted-foreground">
                Telefon: +49 151 64682544
                <br />
                E-Mail: info@kitech-software.de
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Vertreten durch</h2>
              <p className="text-muted-foreground">Geschäftsführer: Ayham Alkhalil</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Registereintrag</h2>
              <p className="text-muted-foreground">
                Eintragung im Handelsregister.
                <br />
                Registergericht: Amtsgericht Hannover
                <br />
                Registernummer: HRB 230077
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Umsatzsteuer-ID</h2>
              <p className="text-muted-foreground">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
                <br />
                DE459778632
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
              <p className="text-muted-foreground">
                Ayham Alkhalil
                <br />
                Wedekindstraße 14
                <br />
                30161 Hannover
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">EU-Streitschlichtung</h2>
              <p className="text-muted-foreground">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                {/* `break-words`: die Adresse ist als ein Wort gesetzt und hatte
                    bei 320 px Bildschirmbreite 4 px ueber den Rand geschoben
                    (gemessen 23.08.2026). Ein Rechtstext darf auf keinem Geraet
                    seitlich wegscrollen. */}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-words"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
