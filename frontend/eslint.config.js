import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
export default [
  { ignores: ["dist/**", "src/data/cities.json"] },
  {
    files: ["src/**/*.{js,jsx}", "scripts/*.mjs", "tests/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react },
    rules: {
      ...js.configs.recommended.rules,
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },
];
