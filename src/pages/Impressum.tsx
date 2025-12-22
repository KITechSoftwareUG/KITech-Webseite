import { Layout } from "@/components/layout/Layout";
export default function Impressum() {
  return <Layout>
      <section className="py-20 lg:py-28">
        <div className="container max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Impressum</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Angaben gemäß § 5 TMG</h2>
              <p className="text-muted-foreground">
                KITech Software UG (haftungsbeschränkt)<br />
                Wedekindstraße 14    <br />
                30161 Hannover    <br />
                Deutschland
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
              <p className="text-muted-foreground">
                Telefon: +49 (0) 123 456 789<br />
                E-Mail: info@kitech-software.de
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Vertreten durch</h2>
              <p className="text-muted-foreground">
                Geschäftsführer: Max Mustermann
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Registereintrag</h2>
              <p className="text-muted-foreground">
                Eintragung im Handelsregister.<br />
                Registergericht: Amtsgericht Musterstadt<br />
                Registernummer: HRB 123456
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Umsatzsteuer-ID</h2>
              <p className="text-muted-foreground">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                DE123456789
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <p className="text-muted-foreground">
                Max Mustermann<br />
                Musterstraße 123<br />
                12345 Musterstadt
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">EU-Streitschlichtung</h2>
              <p className="text-muted-foreground">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                https://ec.europa.eu/consumers/odr/
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>;
}