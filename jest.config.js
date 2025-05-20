/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  transform: {
    // Suppresses message TS151001: "If you have issues related to imports, you
    // should consider setting `esModuleInterop` to `true` …"
    "^.+\\.ts$": ["ts-jest", { diagnostics: { ignoreCodes: ["TS151001"] } }],
  },
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  globalSetup: "./tests/global-setup.ts",
  globalTeardown: "./tests/global-teardown.ts",

  // Disables parallelization of tests to avoid "callback server not initialized" errors
  maxConcurrency: 1,
  maxWorkers: 1,
};
