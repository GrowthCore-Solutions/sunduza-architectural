import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Data-access boundary: the UI, route, and shared layers must never import
  // the Prisma client directly. They go through services; only repositories
  // (and the backend lib that owns transactions) touch the database. Keeps the
  // layering from regressing — see docs/design/DATA_ACCESS.md.
  {
    files: ["app/**/*.{ts,tsx}", "src/frontend/**/*.{ts,tsx}", "src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/backend/lib/db", "**/backend/lib/db"],
              message:
                "Do not access the database outside the repository layer. Call a service instead (see docs/design/DATA_ACCESS.md).",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
