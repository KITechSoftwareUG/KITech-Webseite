# Relaunch-Konzept KITech-Webseite

> Stand: 2026-07-29. Arbeitsdokument — wird fortgeschrieben, während wir Stück für Stück bauen.
> Quelle: Konzept-Briefing Ayham Alkhalil.

---

## Leitgedanke

Aus der Corporate-Website wird ein **High-Tech-Funnel mit halbem SaaS-Charakter**:

1. **Startseite** = radikaler Ergebnis-Beweis (harte Zahlen, echte Kunden, echte Gesichter).
2. **Zwei Sales-Letter-Funnels** ziehen kaltes Publikum rein und segmentieren es (Einzelperson vs. Unternehmen).
3. **Terminbuchung** ist der eine Conversion-Punkt, überall erreichbar.
4. **Learning-Portal** (Login/Registrierung, Supabase) macht aus Besuchern wiederkehrende, zahlende Nutzer.
5. **Community** als Bindeglied und Wiederkehr-Motor.

Prinzip durchgehend: **keine Behauptungen, nur Belege.** Jede Zahl auf der Seite muss aus einem echten Projekt stammen.

---

## 1. Startseite

### 1.1 Hero — FERTIG
`src/pages/Home.tsx`, Route `/`. Bleibt wie er ist.

- Video-Idee (Kunden-Video → Ayham-Video) ist **zurückgestellt**. Die Media-Kachel bleibt vorerst die abstrakte Signal-Fläche.
- Offen für später: Wenn ein Ayham-Video kommt, ersetzt es genau diese Kachel (Poster-Frame + Klick-to-Play, kein Autoplay, DSGVO-konform selbst gehostet statt YouTube).

### 1.2 Kunden-Ergebniskarten — NEU, direkt unter dem Hero

**Layout:** sechs große Karten, 2 Spalten auf Desktop (je ~544 px breit), 1 Spalte mobil.
Das **Portrait des Kunden ragt oben über den Kartenrand hinaus** — deshalb hat der
Kartenkörper einen eigenen, aufgehellten Grund: auf dem near-black Seitenhintergrund
wäre die Karte unsichtbar und der Überstand als Effekt nicht wahrnehmbar.

**Die sechs Projekte (Briefing 30.07.2026):**

| # | Person | Kunde | Kernzahl | Projekt |
|---|---|---|---|---|
| 1 | Dennis Mikyas | NiImmo Wohnungsbaugesellschaft | 1,5 Vollzeitstellen | Komplettes Portal, 40 Tage bis live |
| 2 | Jan Uwe Pane | cert consulting Pane | 1,2 Vollzeitkräfte | Zertifizierungsmanagement-Portal, 60 Tage |
| 3 | Leon Battel | KlarGehalt.de | 2 Monate von null auf live | SaaS zur Entgelttransparenzrichtlinie, mit Bezahlsystem |
| 4 | Felix Bechtoldt | 4 Unternehmen, 9 Zielgruppen | 100+ Leads jeden Morgen um 8 | Vertriebs-Pipeline, 3 Std Recherche → 2 Min |
| 5 | Benjamin Ronneburg | Pflegexperts | 4 Wochen bis Setup | Komplettes Claude-Code-Setup |
| 6 | Mike Letzgus | Nereo | 3 Wochen bis Setup | Komplettes Claude-Code-Setup |

Alle sechs Karten sind inhaltlich freigegeben (Stand 30.07.2026). Einziger offener
Punkt pro Karte: **das Personenfoto**.

Logos liegen für NiImmo, cert consulting und Pflegexperts vor und stehen auf der Karte
in einem hellen Kasten (die Kundenlogos sind gemischt transparent/weiß hinterlegt und
würden auf dem dunklen Kartengrund sonst teils verschwinden).

**Zwei Transkriptions-Korrekturen** (aus dem Diktat, im Code so umgesetzt):
- „Cloud Code" → **Claude Code** (Projekte 5 und 6)
- „KlageHeld.de" → **KlarGehalt**, weil die Entgelttransparenzrichtlinie inhaltlich
  dorthin passt und KlarGehalt im KITech-Portfolio steht. **Muss bestätigt werden.**

Was pro Karte noch offen ist, steht im Feld `openPoints` in
`src/data/client-results.ts` und wird auf der Karte als Marker angezeigt.

**Pro Karte:**

**Pro Karte:**

| Element | Inhalt |
|---|---|
| Portrait | Foto der Person beim Kunden, ragt über den oberen Kartenrand |
| Kopfzeile | Name, Firma, Logo (rechts neben dem Portrait; mobil darunter) |
| Kernzahl | Eine radikale Zahl, groß in `kinetic-data` |
| Ein Satz | Was gebaut wurde |
| Belegzeilen | Projektdauer, Vorher → Nachher, weitere Kennzahl |
| Link | → Detail-Referenzseite `/referenzen/:slug` |

**Gestaltung:** scharfkantig (keine `rounded-*`), gleiche Bildsprache wie der Hero.

**Noch blockiert:** alle sechs Personenfotos fehlen (Initialen-Platzhalter mit Marker
„Foto fehlt"). Fotos nach `public/images/kunden/` legen und den Pfad in
`src/data/client-results.ts` eintragen.

> **Vor dem Livegang:** jede Karte braucht die schriftliche Freigabe des Kunden für
> Name, Foto und Zahlen.

### 1.3 Team-Sektion „Wer sind wir" — NEU, ersetzt die aktuelle reine Bild-Sektion

- Ayham groß und zentral (bestehendes `ayham-portrait.webp` bzw. neues Foto).
- Drumherum **drei kleinere Portraits**, versetzt platziert, leicht schwebend/parallax: **Leon**, **Jörg**, **Jennifer**.
- Kurzer Text zu KITech als Team. Rolle/Name pro Person beim Hover oder direkt unter dem Bild.
- `leon-portrait.webp` existiert. **Jörg und Jennifer fehlen.**

### 1.4 Danach

Bewusst **kurz halten**. Nach der Team-Sektion nur noch:
- CTA-Block „Erstgespräch buchen"
- Footer (rechtliche Links)

Der Logo-Marquee bleibt zwischen Hero und Karten.

---

## 2. Seitenstruktur & Navigation

```
/                             Startseite (Hero, Kundenkarten, Team, CTA)
/warum-du-mit-ki-kein-geld-verdienst      Sales Letter — Einzelperson / Solo
/warum-unternehmen-mit-ki-kein-geld-verdienen   Sales Letter — B2B
/referenzen                   Case Studies ausführlich
/referenzen/:slug             Einzelner Case
/termin                       Terminbuchung (freundlicher als heute)
/community                    Community-Seite
/portal                       Learning-Portal (Login-geschützt)
/portal/login  /portal/registrieren
/impressum  /datenschutz  /agb
```

**Header:** links Logo, rechts die Funnel-Links + **„Learning-Portal"** als abgesetzter Button (Login/Registrieren). Der heutige „Anmelden"-Button zeigt auf `VITE_PORTAL_URL` (LogTo) — das muss aufgelöst werden, siehe [Offene Architektur-Entscheidungen](#offene-architektur-entscheidungen).

**Terminbuchungs-CTA:** taucht mehrfach auf — Hero, nach den Kundenkarten, am Ende jedes Sales Letters, im Footer. Alle zeigen auf dieselbe Route (heute `/lass-uns-reden`, ggf. umbenennen auf `/termin`).

---

## 3. Die zwei Sales-Letter-Seiten

Aufbau wie ein klassischer Sales Letter, nicht wie eine Leistungsseite:

1. Harte Headline mit dem Schmerz („Warum du mit KI kein Geld verdienst")
2. Problem benennen — konkret, ohne Weichspüler
3. Warum die üblichen Antworten nicht funktionieren
4. Der eigentliche Grund
5. Was stattdessen funktioniert (der KITech-Weg)
6. Beweis: Kundenzahlen, Fotos
7. CTA: Erstgespräch
8. Nachfass-CTA am Ende

**Bilder von Ayham links und rechts eingestreut**, als Rhythmus-Brecher zwischen den Textblöcken — nicht dekorativ, sondern als visuelle Atempause. Ayham liefert dafür einen Bilder-Satz.

**Segmentierung:** Solo-Seite → Coaching/Learning-Portal. Unternehmens-Seite → Erstgespräch/Projekt.

**Bestandscode:** `Solo.tsx` (30 KB) und `Enterprise.tsx` (47 KB) decken thematisch genau diese zwei Zielgruppen ab, sind aber im alten Design-System gebaut (`rounded-*`, `gradient-text`). Entscheidung dazu offen — siehe unten.

---

## 4. Learning-Portal

**Zielbild:** kein Videokurs-Shop, sondern **1:1-Begleitung in Paketen** — gemeinsames Arbeiten, monatliche Beiträge, Community-Zugang. Videoinhalte höchstens flankierend.

**Technisch (Vorschlag):**

| Baustein | Lösung |
|---|---|
| Auth | Supabase Auth (E-Mail + Passwort, optional Magic Link) |
| Datenhaltung | Supabase Postgres, **RLS ist die Sicherheitsgrenze** |
| Serverlogik | Supabase Edge Functions (die Website selbst ist eine reine Client-SPA, hat kein Backend) |
| Zahlungen (später) | Stripe, angebunden über Edge Function + Webhook |
| Region | **EU (Frankfurt)** wählen — sonst DSGVO-Thema |

**Reihenfolge des Baus:**
1. Supabase-Projekt anlegen, Client + Env-Vars, Auth-Kontext in der SPA
2. Login/Registrieren/Passwort-vergessen + geschützte Route
3. Portal-Dashboard (leer, aber echt)
4. Datenmodell: Nutzer, Paket, Session/Termin, Inhalt
5. Zahlungen — später, eigener Schritt

**Vor dem Livegang nötig:** Datenschutzerklärung um Supabase als Auftragsverarbeiter ergänzen, AVV abschließen. (Calendly fehlt dort übrigens auch noch.)

---

## 5. Content-Lücken

Was ich von Ayham brauche, bevor die jeweilige Sektion gebaut/live gehen kann:

- [ ] **Sechs Personenfotos** für die Ergebniskarten (Dennis, Jan Uwe, Leon, Felix, Benjamin, Mike) — nach `public/images/kunden/`, Pfad in `client-results.ts` eintragen
- [ ] **Schriftliche Freigabe** dieser Kunden für Name, Foto und Zahlen (Referenzen mit Personenfotos und Euro-Beträgen brauchen ein OK — DSGVO + Wettbewerbsrecht)
- [ ] **Portraits Jörg und Jennifer** (Leon liegt vor), plus Rollenbezeichnungen für alle drei
- [ ] **Bilder-Satz Ayham** für die Sales-Letter-Seiten (mehrere Motive, quer/hoch gemischt)
- [ ] **Inhalt der beiden Sales Letter** — Rohtext oder Stichpunkte, ich gieße es in Form
- [ ] **Coaching-Konzept**: Paketnamen, Leistungsumfang, Preise, Laufzeit
- [ ] Klärung: Woher stammen „50+ Projekte" und „98% Kundenzufriedenheit" im aktuellen Hero?

---

## Architektur-Entscheidungen

### A) Ein Repo, zwei Domains, LogTo — ENTSCHIEDEN (31.07.2026)

**Diese Entscheidung ersetzt die frühere Empfehlung „Supabase gewinnt" vom 29.07.2026.**

| Domain | Inhalt | Rendering |
|---|---|---|
| `kitech-software.de` | öffentliche Marketing-Seiten | statisch vorgerendert |
| `app.kitech-software.de` | eingeloggter Bereich mit `/auth` | dynamisch |

Beides kommt aus **einem** Repo und einem Deployment. Der Host-Rewrite in
`src/proxy.ts` mappt die App-Domain auf das interne Segment `src/app/app/*`.

**Auth: LogTo** (selbst gehostet), nicht Supabase.

**Bewusst in Kauf genommener Trade-off:** Getrennte Domains bedeuten bei LogTo
**keine gemeinsame Session**. Das Next-SDK setzt host-only Cookies und bietet keine
Cookie-Domain-Option — ein Cookie auf `app.kitech-software.de` ist von
`kitech-software.de` technisch nicht lesbar. Die Marketing-Seite kann also nie
„Angemeldet als …" anzeigen. Ayham kennt den Trade-off und hat sich dafür
entschieden: Marketing und App sind bewusst getrennte Welten.

**Inhalte des eingeloggten Bereichs** (festgelegt 31.07.2026):
1:1-Coaching-Sessions · Community/Austausch · Materialien & Ressourcen

### A2) Zwei Blocker vor dem Livegang des Logins

1. **LogTo hat kein TLS.** Der Container antwortet auf
   `http://logto-…​.87.106.200.173.sslip.io` — reines HTTP. Nutzer von der
   HTTPS-Seite dorthin zu schicken hieße, Passwörter im Klartext zu übertragen.
   Zusätzlich enthält die CSP `upgrade-insecure-requests`, was den Redirect auf
   `https://` umschreiben kann → Login bräche stillschweigend.
   **Ayham richtet `auth.kitech-software.de` mit Zertifikat ein.**
   Wichtig: Der Issuer steckt in allen ausgestellten Tokens — ein späterer Wechsel
   invalidiert alle Sessions. Also vor dem ersten echten Login erledigen.

2. **Coolify steht noch auf `nixpacks`/Port 80.** Next.js braucht
   `dockerfile`/Port 3000. Siehe `deploy/COOLIFY.md`.

### A3) Behoben: `.env` lag im Git-Repo
`.env` war getrackt, `.gitignore` hatte keinen Eintrag dafür. Enthielt bis dahin nur
Plausible- und Supabase-Werte, aber die LogTo-Secrets wären dort gelandet.
Am 31.07.2026 aus dem Index genommen und `.gitignore` ergänzt.

### B) SEO ist strategisch — ENTSCHIEDEN (29.07.2026), UMGESETZT (30.07.2026)
Damit reichte die Client-Side-SPA nicht mehr. **Der Umzug auf Next.js ist erledigt.**

Nachweis: `curl` auf die Startseite liefert **55 KB fertiges HTML** mit allen
Kundenzahlen, Meta-Tags, Canonical, OpenGraph und JSON-LD — ohne dass ein einziges
Byte JavaScript ausgeführt wurde. Vorher kam ein leeres `<div id="root">`.
Alle Routen werden beim Build statisch vorgeneriert.

### C) Warum Next.js überhaupt (Hintergrund)
Beide Entscheidungen zeigen in dieselbe Richtung:

| Anforderung | Was sie erzwingt |
|---|---|
| Funnel-Seiten sollen ranken | Server-Rendering / statische Generierung |
| Ein Login statt zwei | Serverseitige Session-Verwaltung |
| Später Zahlungen (Stripe) | Server-Endpunkt für Webhooks |

Alle drei bekommt man mit Next.js in **einem** Projekt: Website und Portal unter
derselben Domain, ein Auth-System, ein Deployment. Das bestehende
`kitech-app-portal` ist bereits Next.js und damit der natürliche Zielort.

**Zeitpunkt:** je früher, desto billiger — jede weitere Seite in der SPA ist später
Portierungsarbeit. Der Umzug selbst ist mechanisch, nicht konzeptionell:
`react-router` → `next/navigation`, `SEOHead` → Metadata-API, `"use client"` auf die
interaktiven Komponenten. Tailwind-Klassen, Framer Motion und die JSX-Struktur bleiben
unverändert.

**Bis dahin** wird migrationsfreundlich gebaut: Inhalte liegen in `src/data/`, nicht
inline in Komponenten; neue Bilder gehören nach `public/`, nicht in `src/assets`.

### D) Solo.tsx / Enterprise.tsx — recyceln oder neu?
Entscheidung: **neu gebaut** im aktuellen Design-System (siehe `SalesLetter.tsx`).
Die Altdateien (30 KB / 47 KB, altes Design-System) bleiben als Textquelle liegen,
werden aber nicht umgebaut.

---

## Stand der Umsetzung

### Gebaut (29.07.2026) — alles mit sichtbar markierten Platzhaltern

| Was | Dateien |
|---|---|
| Kunden-Ergebniskarten, 2×2 | `components/sections/ClientResults.tsx`, `data/client-results.ts` |
| Team-Sektion, Ayham + 3 schwebende Portraits | `components/sections/TeamSection.tsx`, `data/team.ts` |
| Abschluss-CTA | `components/sections/FinalCta.tsx` |
| Kopfzeile mit Navigation + Learning-Portal-Button | `components/layout/SiteHeader.tsx` |
| Beide Sales Letter aus einer Vorlage | `components/sections/SalesLetter.tsx`, `data/sales-letters.ts`, `pages/Warum*.tsx` |
| Platzhalterseite für noch leere Routen | `pages/ComingSoon.tsx` |

Platzhalter tragen einen sichtbaren Marker („PLATZHALTER", „FOTO FEHLT", „Bild von
Ayham folgt"). Seiten mit reinem Platzhaltertext stehen auf `noindex`. Der Marker
verschwindet, sobald in den `data/`-Dateien `isPlaceholder` entfernt wird.

### Offen

| # | Schritt | Blockiert durch |
|---|---|---|
| 1 | **Coolify auf Build Pack `dockerfile` + Port 3000 umstellen** | Muss vor dem nächsten Deploy passieren, sonst bricht die Seite |
| 2 | Personenfotos der sechs Kunden einsetzen | Fotos von Ayham |
| 3 | Sales-Letter-Texte einsetzen | Rohtext + Bilder von Ayham |
| 4 | Portraits Jörg/Jennifer + Rollen | Fotos |
| 5 | Terminbuchungsseite freundlicher gestalten | — |
| 6 | Referenz-Detailseiten | Case-Study-Inhalte |
| 7 | Supabase-Setup + Auth + geschützte Route | Supabase-Projekt |
| 8 | LogTo ablösen, Portal einziehen, Nutzer migrieren | Auth-Entscheidung |
| 9 | Portal-Dashboard | Coaching-Konzept |
| 10 | Community-Seite | Plattform-Entscheidung |
| 11 | Zahlungen (Stripe über Route Handler) | Preismodell |
| 12 | Aufräumen: `src/views/legacy/`, ungenutzte shadcn/ui-Primitives, `react-router-dom` | — |

### Nach dem Umzug offen / bewusst nicht gemacht

- **`next/image` wird noch nicht genutzt.** Alle Bilder laufen weiter über `<img>`.
  Das funktioniert, verschenkt aber automatische Optimierung (WebP/AVIF, responsive
  Größen, kein Layout-Shift). Lohnt sich als eigener Schritt, weil jedes Bild
  Maßangaben braucht.
- **Legacy bleibt liegen:** `src/views/legacy/` (10 Alt-Seiten) ist aus TypeScript-
  und ESLint-Prüfung ausgenommen, aber noch im Repo — die Tests lesen drei dieser
  Dateien per `?raw`. `react-router-dom` bleibt deshalb als Dependency installiert.
