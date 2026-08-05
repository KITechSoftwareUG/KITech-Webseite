import type { Metadata } from "next";
import { Providers } from "./providers";
import { BASE_URL } from "@/lib/metadata";
import "@/index.css";

/**
 * Root-Layout. Die Schriften (Onest, Recursive Variable, IBM Plex Mono) kommen
 * weiterhin per @fontsource-Import aus `src/index.css` — sie werden lokal
 * gebündelt, es geht also keine Anfrage an Google Fonts raus (DSGVO).
 *
 * `suppressHydrationWarning` am <html> ist nötig, weil next-themes die
 * Theme-Klasse vor dem ersten Paint per Skript setzt.
 */
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "KITech Software – Anwendungspartner für KI im Mittelstand",
  description:
    "Wir sind euer Anwendungspartner für KI — von der Anwendung im Tagesgeschäft bis zum messbaren Ergebnis.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
