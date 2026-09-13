import { defineConfig } from "oxlint";

import { oxlintConfigNoJSDoc } from "./src/index.ts";

export default defineConfig({
    ...oxlintConfigNoJSDoc,
    overrides: [
        {
            files: ["src/base-rules.ts", "src/index.ts"],
            rules: {
                "max-lines": "off"
            }
        },
        {
            files: ["src/eslint-core-plugin.ts"],
            rules: {
                "typescript/no-deprecated": "off"
            }
        }
    ],
    rules: {
        "sort-keys": "off"
    }
});
