import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        CURRENT_YEAR: "readonly",
      },
    },
  },
  pluginJs.configs.recommended,
  {
    ignores: ["node_modules", "dist", "vite.config.js"],
  },
];
