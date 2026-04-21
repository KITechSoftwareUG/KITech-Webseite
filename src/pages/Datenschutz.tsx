import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";

export default function Datenschutz() {
  return (
    <Layout>
      <SEOHead
        title="Datenschutzerklärung | KITech Software"
        description="Datenschutzerklärung der KITech Software UG – Informationen zur Datenverarbeitung gemäß DSGVO."
        canonical="/datenschutz"
        noindex={true}
      />
      <section className="py-20 lg:py-28">
        <div className="container max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Datenschutz auf einen Blick</h2>
              <h3 className="text-lg font-medium mb-2">Allgemeine Hinweise</h3>
              <p className="text-muted-foreground">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
                passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
                persönlich identifiziert werden können.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. Verantwortliche Stelle</h2>
              <p className="text-muted-foreground">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
                <br />
                <br />
                KITech Software UG (haftungsbeschränkt)
                <br />
                Wedekindstraße 14
                <br />
                30161 Hannover
                <br />
                <br />
                Telefon: +49 (0) 151 64682544
                <br />
                E-Mail: info@kitech-software.de
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. Datenerfassung auf dieser Website</h2>
              <h3 className="text-lg font-medium mb-2">Kontaktformular</h3>
              <p className="text-muted-foreground">
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular
                inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall
                von Anschlussfragen bei uns gespeichert.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Analyse & Besuchermessung</h2>

              <h3 className="text-lg font-medium mb-2">Plausible Analytics (self-hosted)</h3>
              <p className="text-muted-foreground mb-4">
                Mit Ihrer Einwilligung verwenden wir Plausible Analytics zur anonymen Reichweitenmessung.
                Plausible ist eine datenschutzfreundliche, cookiefreie Analysesoftware. Es werden keine
                personenbezogenen Profile erstellt und keine Daten an Dritte weitergegeben.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Besonderheit:</strong> Unsere Plausible-Instanz wird ausschließlich auf unserem
                eigenen Server in Deutschland betrieben. Es findet kein Datentransfer an{" "}
                <em>plausible.io</em> oder andere externe Server statt.
              </p>
              <p className="text-muted-foreground mb-4">
                Erfasst werden: aufgerufene Seite, Herkunftsland, Gerätekategorie, Betriebssystem,
                Browser sowie die verweisende Website (Referrer). Die IP-Adresse wird nicht
                gespeichert. Die Daten sind nicht einer einzelnen Person zuordenbar.
              </p>
              <p className="text-muted-foreground mb-6">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Sie können Ihre
                Einwilligung jederzeit über den Link „Cookie-Einstellungen" im Footer widerrufen.
              </p>

              <h3 className="text-lg font-medium mb-2">Besucheridentifikation (ipinfo.io)</h3>
              <p className="text-muted-foreground mb-4">
                Mit Ihrer Einwilligung zur Analyse ermitteln wir zusätzlich auf Basis Ihrer IP-Adresse
                die zugehörige Organisation bzw. den Internetdienstanbieter (ISP), Ihren ungefähren
                Standort (Stadt, Land) sowie ggf. den Hostnamen. Dies geschieht über den Dienst{" "}
                <strong>ipinfo.io</strong> (IPinfo, Inc., 16 Maiden Lane Suite 301, San Francisco,
                CA 94108, USA).
              </p>
              <p className="text-muted-foreground mb-4">
                Zweck ist die Auswertung, welche Unternehmen und Organisationen unsere Website besuchen
                (B2B-Reichweitenanalyse). Eine Identifikation einzelner Personen ist damit nicht möglich.
                Die gewonnenen Daten (Org-Name, Stadt, Land) werden intern gespeichert und nach 7 Tagen
                automatisch gelöscht. Ihre vollständige IP-Adresse wird von uns nicht dauerhaft
                gespeichert.
              </p>
              <p className="text-muted-foreground mb-4">
                IPinfo verarbeitet die IP-Adresse auf US-amerikanischen Servern. Die Datenübertragung
                erfolgt auf Grundlage der Standardvertragsklauseln gemäß Art. 46 Abs. 2 lit. c DSGVO.
                Weitere Informationen finden Sie in der Datenschutzerklärung von IPinfo:{" "}
                <a
                  href="https://ipinfo.io/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ipinfo.io/privacy-policy
                </a>.
              </p>
              <p className="text-muted-foreground">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Sie können Ihre
                Einwilligung jederzeit über „Cookie-Einstellungen" im Footer widerrufen.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Ihre Rechte</h2>
              <p className="text-muted-foreground">
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer
                gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder
                Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben,
                können Sie diese Einwilligung jederzeit für die Zukunft widerrufen.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">6. SSL-Verschlüsselung</h2>
              <p className="text-muted-foreground">
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine
                SSL-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des
                Browsers von "http://" auf "https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
