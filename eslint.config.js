const js = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  { ignores: ["main.js", "esbuild.config.mjs", "node_modules/**"] },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      // Mirrors the previous `.eslintrc` extends, in order:
      // eslint:recommended → @typescript-eslint/eslint-recommended → recommended
      ...js.configs.recommended.rules,
      ...tseslint.configs["flat/eslint-recommended"].rules,
      ...tseslint.configs["flat/recommended"].reduce(
        (acc, config) => Object.assign(acc, config.rules),
        {},
      ),

      // Project overrides
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
      "@typescript-eslint/ban-ts-comment": "off",
      "no-prototype-builtins": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
];
