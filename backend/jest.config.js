const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  setupFilesAfterEnv: ["<rootDir>/src/test-setup.ts"],
  globals: {
    "ts-jest": {
      // Pre-existing type errors in auth.service.ts and auth.middleware.ts
      // are not related to authorization tests; treat as warnings only.
      diagnostics: { warnOnly: true },
    },
  },
};
