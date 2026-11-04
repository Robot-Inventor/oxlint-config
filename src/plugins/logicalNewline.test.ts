import { describe, it } from "vitest";
import { RuleTester } from "oxlint/plugins-dev";
import { invalidCases } from "./logicalNewlineInvalidCases.ts";
import { logicalNewlineRule } from "./logicalNewline.ts";
import { validCases } from "./logicalNewlineValidCases.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
    languageOptions: {
        sourceType: "module",
        parserOptions: {
            lang: "ts"
        }
    },
    recursive: true
});

ruleTester.run("logical-newline", logicalNewlineRule, {
    invalid: invalidCases,
    valid: validCases
});
