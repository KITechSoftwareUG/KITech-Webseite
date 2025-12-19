import { Layout } from "@/components/layout/Layout";

export default function Datenschutz() {
  return (
    <Layout>
      <section className="py-20 lg:py-28">
        <div className="container max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Datenschutz auf einen Blick</h2>
              <h3 className="text-lg font-medium mb-2">Allgemeine Hinweise</h3>
              <p className="text-muted-foreground">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren 
                personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene 
                Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. Verantwortliche Stelle</h2>
              <p className="text-muted-foreground">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br /><br />
                KITech Software UG (haftungsbeschränkt)<br />
                Musterstraße 123<br />
                12345 Musterstadt<br /><br />
                Telefon: +49 (0) 123 456 789<br />
                E-Mail: info@kitech-software.de
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. Datenerfassung auf dieser Website</h2>
              <h3 className="text-lg font-medium mb-2">Kontaktformular</h3>
              <p className="text-muted-foreground">
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben 
                aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten 
                zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Ihre Rechte</h2>
              <p className="text-muted-foreground">
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger 
                und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben 
                außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. 
                Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese 
                Einwilligung jederzeit für die Zukunft widerrufen.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. SSL-Verschlüsselung</h2>
              <p className="text-muted-foreground">
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung 
                vertraulicher Inhalte eine SSL-Verschlüsselung. Eine verschlüsselte Verbindung 
                erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" 
                wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
