import type { ESLint } from "eslint";
import { builtinRules } from "eslint/use-at-your-own-risk";

const corePlugin = {
    meta: {
        name: "eslint-core-compat"
    },
    rules: Object.fromEntries(builtinRules)
} as const satisfies ESLint.Plugin;

export default corePlugin;
