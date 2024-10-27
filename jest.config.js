/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  // Use ts-jest preset to handle TypeScript files
  preset: "ts-jest",

  // Test environment setup (you can change it to 'jsdom' if testing browser environment)
  testEnvironment: "node",

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Add the glob patterns Jest uses to detect test files
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],

  // Specify the module file extensions for Jest to resolve
  moduleFileExtensions: [
    "js",
    "mjs",
    "cjs",
    "jsx",
    "ts",
    "tsx",
    "json",
    "node",
  ],

  // Enable the `transform` option to use ts-jest for TypeScript files
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Transforms TypeScript files with ts-jest
  },

  // Configure module name mapper for path aliases (if you are using aliases like #/ for custom imports)
  moduleNameMapper: {
    "^#/(.*)$": "<rootDir>/src/tests/$1",
  },

  // Paths to modules that run some code to set up the testing environment before each test
  setupFilesAfterEnv: [],

  // Ignore patterns for paths to exclude from transformation
  transformIgnorePatterns: ["\\\\node_modules\\\\", "\\.pnp\\.[^\\\\]+$"],

  // The maximum amount of workers used to run your tests (you can adjust this)
  maxWorkers: "50%",

  // Coverage settings
  coverageProvider: "v8",
};

module.exports = config;
