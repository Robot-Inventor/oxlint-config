import { controlFlowBracesRule } from "./controlFlowBraces.ts";
import { eslintCompatPlugin } from "@oxlint/plugins";
import { extractComplexConditionRule } from "./extractComplexCondition.ts";
import { logicalNewlineRule } from "./logicalNewline.ts";
import { objectNewlineRule } from "./objectNewline.ts";
import { requireAsConstRule } from "./requireAsConst.ts";

const plugin = eslintCompatPlugin({
    meta: {
        name: "roboin"
    },
    rules: {
        "control-flow-braces": controlFlowBracesRule,
        "extract-complex-condition": extractComplexConditionRule,
        "logical-newline": logicalNewlineRule,
        "object-newline": objectNewlineRule,
        "require-as-const": requireAsConstRule
    }
});

export default plugin;
