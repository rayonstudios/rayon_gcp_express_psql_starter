import unusedImports from "eslint-plugin-unused-imports";

module.exports = {
  root: true,
  env: { es6: true },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["dist", "eslint.config.js"],
  parser: "@typescript-eslint/parser",
  plugins: {
    "unused-imports": unusedImports,
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
};
