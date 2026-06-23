import { Header } from "./Header";
import { Footer } from "./Footer";
import { StickyMobileCTA } from "@/components/conversion/StickyMobileCTA";
import { ExitIntentPopup } from "@/components/conversion/ExitIntentPopup";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <StickyMobileCTA />
      <ExitIntentPopup />
    </div>
  );
}
