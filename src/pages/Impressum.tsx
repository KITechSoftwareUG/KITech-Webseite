import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData, getWebPageSchema } from "@/components/seo/StructuredData";

export default function Impressum() {
  return (
    <Layout>
      <SEOHead
        title="Impressum – KITech Software"
        description="Impressum der KITech Software UG (haftungsbeschränkt). Angaben gemäß § 5 TMG."
        canonical="/impressum"
      />
      <StructuredData data={getWebPageSchema("Impressum", "Impressum der KITech Software UG", "https://kitech-software.de/impressum")} />
      <section className="py-20 lg:py-28">
        <div className="container max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Impressum</h1>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Angaben gemäß § 5 TMG</h2>
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
              <p className="text-muted-foreground">Geschäftsführer: A. Alkhalil</p>
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
              <h2 className="text-xl font-semibold mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <p className="text-muted-foreground">
                A. Alkhalil
                <br />
                Wedekindstraße 14
                <br />
                30161 Hannover
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
    </Layout>
  );
}
