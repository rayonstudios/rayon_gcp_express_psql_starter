const eslintConfigPrettier = require("eslint-config-prettier");
const unusedImports = require("eslint-plugin-unused-imports");
const eslintPluginJest = require("eslint-plugin-jest");

module.exports = [
  {
    root: true,
    env: { es6: true, node: true },
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:jest/recommended",
    ],
    ignorePatterns: ["dist", "eslint.config.js"],
    parser: "@typescript-eslint/parser",
    plugins: {
      "unused-imports": unusedImports,
      jest: eslintPluginJest,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    overrides: [
      {
        files: ["./tests/**/*"],
        env: {
          jest: true,
        },
      },
    ],
  },
  eslintConfigPrettier,
];
