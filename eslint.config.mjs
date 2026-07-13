import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The "load data in useEffect, then setState" pattern is used across our
      // portal tables. It's correct and intentional; the newer react-hooks rule
      // flags it aggressively. Keep it as a WARNING so CI still gates on real
      // errors — a proper data-fetching layer (M2) will retire these entirely.
      "react-hooks/set-state-in-effect": "warn",
      // Third-party hooks (Clerk, chart.js) can't be statically proven pure.
      "react-hooks/incompatible-library": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
