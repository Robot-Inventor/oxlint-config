import { describe, it } from "vitest";
import { RuleTester } from "oxlint/plugins-dev";
import { extractComplexConditionRule } from "./extractComplexCondition.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            lang: "tsx"
        }
    }
});

ruleTester.run("extract-complex-condition", extractComplexConditionRule, {
    valid: [
        "if (a && b) work();",
        "if ((a ?? b) && c) work();",
        "if (check(a && b, c && d)) work();",
        "if (items.some(item => item.a && item.b && item.c)) work();",
        "while (a && b && c) work();",
        "do work(); while (a && b && c);",
        "for (; a && b && c;) work();",
        "const value = a && b && c;",
        "if (ready) { const value = a && b && c; }"
    ],
    invalid: [
        {
            code: "if (a && b && c) work();",
            errors: [
                {
                    messageId: "extract"
                }
            ]
        },
        {
            code: "if (a) work(); else if (a || (b && c)) work();",
            errors: [
                {
                    messageId: "extract"
                }
            ]
        },
        {
            code: "const result = !(a && b && c) ? 1 : 2;",
            errors: [
                {
                    messageId: "extract"
                }
            ]
        },
        {
            code: "if (check(a && b && c)) work();",
            errors: [
                {
                    messageId: "extract"
                }
            ]
        },
        {
            code: "if ((a && b && c) === true) work();",
            errors: [
                {
                    messageId: "extract"
                }
            ]
        },
        {
            code: "if (a && b && c && d) work();",
            errors: [
                {
                    messageId: "extract"
                }
            ]
        },
        {
            code: "if (check(a && b && c, d || e || f)) work();",
            errors: [
                {
                    messageId: "extract"
                },
                {
                    messageId: "extract"
                }
            ]
        },
        {
            code: "if ((a && b && c) ?? (d || e || f)) work();",
            errors: [
                {
                    messageId: "extract"
                },
                {
                    messageId: "extract"
                }
            ]
        }
    ]
});
