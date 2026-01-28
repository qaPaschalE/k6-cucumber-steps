import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import _import from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import n from "eslint-plugin-n";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...fixupConfigRules(compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
)), {
    plugins: {
        react: fixupPluginRules(react),
        import: fixupPluginRules(_import),
        "simple-import-sort": simpleImportSort,
        n,
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "module",
    },

    settings: {
        react: {
            pragma: "React",
            version: "detect",
        },
    },

    rules: {
        "import/no-cycle": "error",
        "n/no-extraneous-import": "error",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/member-delimiter-style": "off",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-non-null-assertion": "error",
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
        "react/prop-types": "off",
    },
}, {
    files: ["test/**"],

    rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
    },
}];