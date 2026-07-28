import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { CookieConsent } from "./components/CookieConsent";

const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const AGB = lazy(() => import("./pages/AGB"));
const UnderConstruction = lazy(() => import("./pages/UnderConstruction"));
const LassUnsReden = lazy(() => import("./pages/LassUnsReden"));
const EuAiActSelbstcheck = lazy(() => import("./pages/EuAiActSelbstcheck"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* reducedMotion="user" lässt Framer Motion automatisch die Betriebssystem-Einstellung
              "Bewegung reduzieren" respektieren – zentral hier statt pro Komponente. */}
          <MotionConfig reducedMotion="user">
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <Routes>
                <Route path="/" element={<UnderConstruction />} />
                <Route path="/solo" element={<UnderConstruction />} />
                <Route path="/enterprise" element={<UnderConstruction />} />
                <Route path="/leistungen" element={<UnderConstruction />} />
                <Route path="/haltung" element={<UnderConstruction />} />
                <Route path="/referenzen" element={<UnderConstruction />} />
                <Route path="/kontakt" element={<UnderConstruction />} />
                <Route path="/lass-uns-reden" element={<LassUnsReden />} />
                <Route path="/eu-ai-act-selbstcheck" element={<EuAiActSelbstcheck />} />
                <Route path="/selbstcheck" element={<EuAiActSelbstcheck />} />
                <Route path="/impressum" element={<Impressum />} />
                <Route path="/datenschutz" element={<Datenschutz />} />
                <Route path="/agb" element={<AGB />} />
                <Route path="/glossar" element={<UnderConstruction />} />
                <Route path="/glossar/:slug" element={<UnderConstruction />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<UnderConstruction />} />
              </Routes>
            </Suspense>
            <CookieConsent />
          </MotionConfig>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
