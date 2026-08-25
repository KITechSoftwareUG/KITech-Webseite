# Search Console und Bing Webmaster Tools einrichten

Stand 24.08.2026. Beide sind **nicht** eingerichtet — ohne sie ist nicht
sichtbar, für welche Suchbegriffe die Website erscheint, welche Seiten
indexiert sind und welche nicht.

Die Website liefert alles, was die Dienste brauchen: Sitemap, saubere
Canonicals, gültiges JSON-LD. Was fehlt, ist die Bestätigung, dass die Domain
jemandem gehört.

---

## Warum Meta-Tag und nicht DNS

Die Nameserver liegen bei Hostinger (`ns1.dns-parking.com`). Ein TXT-Eintrag
braucht also Zugang zu deren Oberfläche. Das Meta-Tag braucht nur einen Deploy,
und der Weg steht ohnehin bereit.

Der einzige Nachteil: Der Property-Typ **Domain** (mit allen Subdomains) geht
nur über DNS. Für die Zwecke hier genügt **URL-Präfix** auf
`https://kitech-software.de` — die Subdomains `funnel.` und `fokus.` stehen
ohnehin auf `noindex`.

---

## Schritt 1 — Google Search Console

1. https://search.google.com/search-console öffnen, mit dem Google-Konto anmelden.
2. **Property hinzufügen** → Typ **URL-Präfix** → `https://kitech-software.de`
3. Bestätigungsmethode **HTML-Tag** wählen. Google zeigt so etwas:

   ```html
   <meta name="google-site-verification" content="AbC123..." />
   ```

4. **Nur den Wert von `content`** in
   [`src/config/suchkonsolen.ts`](../src/config/suchkonsolen.ts) eintragen:

   ```ts
   export const GOOGLE_SITE_VERIFICATION: string | null = "AbC123...";
   ```

5. Deployen. Danach in der Search Console auf **Bestätigen** klicken.

6. Nach der Bestätigung unter **Sitemaps** eintragen:
   ```
   https://kitech-software.de/sitemap.xml
   ```

---

## Schritt 2 — Bing Webmaster Tools

Der kurze Weg: https://www.bing.com/webmasters → **Import from Google Search
Console**. Das übernimmt Property und Bestätigung in einem Schritt, ein
zweites Meta-Tag entfällt.

Wer den eigenen Weg geht: Meta-Tag-Bestätigung wählen und den Wert aus
`<meta name="msvalidate.01" content="…">` als `BING_SITE_VERIFICATION`
eintragen.

Bing ist mehr als eine Nebensache: Es speist **Microsoft Copilot**. Und
IndexNow — schon eingerichtet und in Betrieb — meldet dorthin, nicht an Google.

---

## Schritt 3 — was danach zu sehen ist

Nicht sofort. Search Console braucht **zwei bis drei Tage** für die ersten
Daten und etwa **16 Monate** für den vollen Verlauf.

Worauf zu achten ist, sobald Zahlen da sind:

| Wo | Was es beantwortet |
|---|---|
| Leistung → Suchanfragen | Für welche Begriffe die Website erscheint, und auf welcher Position |
| Indexierung → Seiten | Welche der 35 Sitemap-Adressen tatsächlich im Index sind |
| Indexierung → Gründe | Warum eine Seite *nicht* drin ist — der nützlichste Bericht überhaupt |
| Sitemaps | Ob die Sitemap gelesen wurde und wann zuletzt |

⚠️ **Die ersten Wochen sind kein Maßstab.** Eine neue Property zeigt anfangs
wenig, und die beiden Artikel vom 24.08.2026 sind Tage alt. Rankings für
Themen mit Wettbewerb entstehen über Monate, nicht über Tage.

---

## Was danach möglich wird

Erst mit Search-Console-Daten lässt sich die Blog-Automatik steuern, statt zu
raten: Welche Artikel bekommen Anfragen, aber keine Klicks — dort stimmt der
Titel nicht. Welche stehen auf Position 11 bis 20 — dort lohnt Nacharbeit mehr
als ein neuer Artikel.

Die API der Search Console lässt sich anbinden, sobald die Property läuft.
Dann kann derselbe Weg wie beim Tagesbericht die Zahlen automatisch abholen.
