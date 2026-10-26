import { describe, it } from "vitest";
import { RuleTester } from "oxlint/plugins-dev";
import { invalidCases } from "./objectNewlineInvalidCases.ts";
import { objectNewlineRule } from "./objectNewline.ts";
import { validCases } from "./objectNewlineValidCases.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            lang: "tsx"
        }
    },
    recursive: true
});

ruleTester.run("object-newline", objectNewlineRule, {
    invalid: invalidCases,
    valid: validCases
});
