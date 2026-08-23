# Bilder der Website

> Wo welche Datei hingehört — und was danach im Code einzutragen ist.

Alles unter `public/` wird **unverändert ausgeliefert**: Datei hineinlegen,
Pfad eintragen, fertig. Kein Import, kein Build-Schritt. Genau deshalb liegen
seit dem 17.08.2026 alle inhaltlichen Bilder hier statt in `src/assets/` — dort
brauchte jedes neue Foto zusätzlich eine Import-Zeile.

```
public/images/
├── team/                    Die eigenen Leute
├── referenzen/
│   ├── portraits/           Gesichter von Kunden
│   └── logos/               Firmenlogos von Kunden
└── og/                      Social-Vorschaubilder (nicht anfassen)
```

## team/

| Datei | Wofür |
|---|---|
| `ayham.webp` | Portrait für Teamliste, `/haltung`, `/kontakt` |
| `ayham-hero.webp` | Der große Freisteller im Hero der Startseite |
| `joerg.webp` | Portrait für die Teamliste |

**Neues Teammitglied:** Foto als `vorname.webp` hier ablegen, dann in
[`src/data/team.ts`](../../src/data/team.ts) Name, Rolle, einen Satz und
`photo: "/images/team/vorname.webp"` eintragen. Ohne Eintrag dort erscheint
niemand — die Datei allein reicht nicht.

Fehlt ein Foto, `photo: null` setzen: dann zeigt die Kachel eine neutrale
Silhouette statt einer leeren Fläche.

**Format:** WebP, Höhe rund 520 px, Gesicht im oberen Drittel (die Liste
schneidet quadratisch von oben zu). Freigestellt (transparenter Hintergrund)
ist am schönsten, aber kein Muss — ein ruhiger heller Hintergrund tut es auch.

## referenzen/portraits/

Gesichter von Kunden, benannt nach der Person (`vorname-nachname.webp`).
Eingetragen werden sie in [`src/data/client-results.ts`](../../src/data/client-results.ts)
unter `person.photo`.

Diese Bilder laufen durch `.portrait-fade` (siehe `src/index.css`) — sie enden
am Brustkorb und werden nach unten weich ausgeblendet. Deshalb: freigestellt,
Höhe rund 520 px.

⚠️ Ein Kundenfoto braucht die Zustimmung der abgebildeten Person. Im Zweifel
`person: null` setzen und nur das Logo zeigen — so läuft es bei `klargehalt.de`.

## referenzen/logos/

Firmenlogos, benannt nach der Firma (`niimmo.png`, `cert-consulting.svg`).
Eingetragen unter `logo` in derselben Datei.

**Format:** SVG, wenn vorhanden — sonst PNG mit **transparentem** Hintergrund.
Die Karten sind weiß; ein Logo mit weißem Kasten drumherum sieht darauf wie ein
aufgeklebter Zettel aus. Dunkle Schrift auf transparent ist richtig.

## Was in `src/assets/` bleibt

Nur noch Dateien, die kein Inhalt sind: das KITech-Logo, Vorlagen-Screenshots
und ungenutzte Altbestände. Wer dort etwas ablegt, braucht eine Import-Zeile im
Code — für Fotos und Kundenlogos ist deshalb dieser Ordner hier der richtige.
