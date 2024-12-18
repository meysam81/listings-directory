module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  rules: {
    // Possible Errors
    "no-console": "warn",
    "no-unused-vars": [
      "error",
      { vars: "all", args: "after-used", ignoreRestSiblings: false },
    ],

    // Best Practices
    eqeqeq: ["error", "always"],
    "no-eval": "error",
    "no-implicit-globals": "error",
    "no-implied-eval": "error",
    "no-return-assign": "error",
    "no-self-compare": "error",

    // Variables
    "no-undef": "error",
    "no-unused-expressions": "error",

    // Style
    indent: ["error", 4],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "single"],
    semi: ["error", "always"],

    // ES6
    "no-var": "error",
    "prefer-const": "off", // Since we're using var by requirement

    // Naming Conventions
    camelcase: ["error", { properties: "always" }],

    // Function Style
    "func-style": ["error", "declaration", { allowArrowFunctions: false }],
  },
  ignorePatterns: ["dist/", "node_modules/"],
};
