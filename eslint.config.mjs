import tsParser from "@typescript-eslint/parser";
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
  // Type-aware linting needs files to be part of the TS project; tsconfig only
  // includes `src`, so everything else is excluded from the lint run.
  {
    ignores: [
      "main.js",
      "esbuild.config.mjs",
      "eslint.config.mjs",
      "node_modules/**",
      "tests/**",
    ],
  },

  // The official Obsidian plugin lint preset (bundles typescript-eslint
  // type-checked rules, eslint-plugin-depend, no-unsanitized, etc.).
  ...obsidianmd.configs.recommended,

  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
];
