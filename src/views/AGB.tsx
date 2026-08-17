import { PageShell } from "@/components/layout/PageShell";
import { TEXT_CONTAINER } from "@/components/layout/site-container";
import { StructuredData, getWebPageSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";

export default function AGB() {
  return (
    <PageShell backdropClassName="absolute inset-x-0 top-0 -z-10 h-[360px]">
      <StructuredData
        data={getWebPageSchema("AGB", "Allgemeine Geschäftsbedingungen von KITech Software", "https://kitech-software.de/agb")}
      />
      <StructuredData
        data={getBreadcrumbSchema([
          { name: "Startseite", url: "https://kitech-software.de" },
          { name: "AGB", url: "https://kitech-software.de/agb" },
        ])}
      />
      <section className="py-20 lg:py-28">
        <div className={TEXT_CONTAINER}>
          {/* Siehe Datenschutz.tsx: "Geschäftsbedingungen" passte bei 36 px auf
              kein Handydisplay und schob die Seite seitwärts. */}
          <h1
            lang="de"
            className="kinetic-display mb-10 hyphens-auto break-words text-[30px] leading-[1.1] text-foreground sm:text-[44px]"
          >
            Allgemeine Geschäftsbedingungen
          </h1>
          
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
    </PageShell>
  );
}
