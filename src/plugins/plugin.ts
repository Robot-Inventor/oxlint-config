import { controlFlowBracesRule } from "./controlFlowBraces.ts";
import { eslintCompatPlugin } from "@oxlint/plugins";
import { objectNewlineRule } from "./objectNewline.ts";
import { requireAsConstRule } from "./requireAsConst.ts";

const plugin = eslintCompatPlugin({
    meta: {
        name: "roboin"
    },
    rules: {
        "control-flow-braces": controlFlowBracesRule,
        "object-newline": objectNewlineRule,
        "require-as-const": requireAsConstRule
    }
});

export default plugin;
