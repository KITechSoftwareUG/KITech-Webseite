import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest laeuft weiterhin ueber Vite - unabhaengig davon, dass die Anwendung
 * selbst mit Next.js gebaut wird. Das ist Absicht: die Tests pruefen reine
 * TS-Module (JSON-LD-Schemas, Breadcrumbs) und lesen einzelne Alt-Seiten per
 * `?raw`-Import, was ein Vite-Feature ist.
 *
 * Bewusst OHNE `@vitejs/plugin-react-swc`: dessen `@swc/helpers`-Version
 * kollidiert mit der von Next.js, wodurch `npm ci` das Lockfile als unsynchron
 * ablehnt und der Docker-Build fehlschlaegt. Vitest transformiert TSX ohnehin
 * selbst; das Plugin liefert nur Fast Refresh, was in Tests keine Rolle spielt.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "node",
  },
});
