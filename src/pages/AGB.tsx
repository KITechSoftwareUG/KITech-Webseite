import { Layout } from "@/components/layout/Layout";

export default function AGB() {
  return (
    <Layout>
      <section className="py-20 lg:py-28">
        <div className="container max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">§ 1 Geltungsbereich</h2>
              <p className="text-muted-foreground">
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge, die zwischen 
                der KITech Software UG (haftungsbeschränkt), nachfolgend "Anbieter", und dem Kunden 
                über die Website des Anbieters oder auf anderem Wege geschlossen werden.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">§ 2 Vertragsschluss</h2>
              <p className="text-muted-foreground">
                Die Darstellung der Dienstleistungen auf der Website stellt kein rechtlich 
                bindendes Angebot, sondern eine Aufforderung zur Abgabe eines Angebots dar. 
                Durch die Beauftragung einer Dienstleistung gibt der Kunde ein verbindliches 
                Angebot ab. Der Vertrag kommt zustande, wenn der Anbieter das Angebot schriftlich 
                oder per E-Mail annimmt.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">§ 3 Leistungserbringung</h2>
              <p className="text-muted-foreground">
                Der Anbieter erbringt seine Leistungen nach dem aktuellen Stand der Technik. 
                Art und Umfang der Leistungen ergeben sich aus der jeweiligen Leistungsbeschreibung 
                und den individuellen Vereinbarungen. Der Anbieter ist berechtigt, zur 
                Leistungserbringung Dritte einzusetzen.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">§ 4 Vergütung und Zahlungsbedingungen</h2>
              <p className="text-muted-foreground">
                Die Vergütung richtet sich nach dem individuell vereinbarten Angebot. Soweit nicht 
                anders vereinbart, sind Rechnungen innerhalb von 14 Tagen nach Rechnungsdatum 
                ohne Abzug zur Zahlung fällig.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">§ 5 Geheimhaltung</h2>
              <p className="text-muted-foreground">
                Der Anbieter verpflichtet sich, alle im Rahmen der Zusammenarbeit erlangten 
                Informationen streng vertraulich zu behandeln. Diese Verpflichtung gilt auch 
                nach Beendigung des Vertragsverhältnisses.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">§ 6 Haftung</h2>
              <p className="text-muted-foreground">
                Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit. Bei 
                leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher 
                Vertragspflichten und der Höhe nach begrenzt auf den vertragstypischen, 
                vorhersehbaren Schaden.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">§ 7 Schlussbestimmungen</h2>
              <p className="text-muted-foreground">
                Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist der Sitz 
                des Anbieters, soweit der Kunde Kaufmann ist oder keinen allgemeinen 
                Gerichtsstand in Deutschland hat.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
