import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

/**
 * `eslint-plugin-react-refresh` ist mit dem Umzug auf Next.js entfallen: seine Regel
 * `only-export-components` widerspricht dem App Router, wo eine Seite neben der
 * Komponente auch `metadata` exportieren MUSS.
 *
 * `src/views/legacy` und die ungenutzten shadcn/ui-Primitives sind ausgenommen —
 * sie sind nicht geroutet bzw. unverändert generiert und werden separat aufgeräumt,
 * sollen aber nicht bei jedem Lauf Rauschen erzeugen.
 */
export default tseslint.config(
  {
    ignores: [
      ".next",
      "dist",
      "next-env.d.ts",
      "src/views/legacy/**",
      "src/components/ui/**",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
