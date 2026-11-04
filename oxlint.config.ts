import { defineConfig } from "oxlint";
import { oxlintConfig } from "./src/index.ts";

export default defineConfig({
    ...oxlintConfig,
    overrides: [
        {
            files: ["src/baseRules.ts", "src/index.ts"],
            rules: {
                "max-lines": "off"
            }
        },
        {
            files: ["src/eslintCorePlugin.ts"],
            rules: {
                "typescript/no-deprecated": "off"
            }
        }
    ],
    rules: {
        "sort-keys": "off"
    }
});
