import { describe, it } from "vitest";
import { RuleTester } from "oxlint/plugins-dev";
import { requireAsConstRule } from "./requireAsConst.ts";

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

ruleTester.run("require-as-const arrays", requireAsConstRule, {
    valid: [
        {
            name: "array literals outside const initializers are ignored",
            code: "[1, 2].map(fn); let items = [1]; const [item] = [1];"
        },
        {
            name: "already asserted and annotated arrays are ignored",
            code: "const a = [1] as const; const b: number[] = [1];"
        },
        {
            name: "array writes and mutating methods are ignored",
            code: "const a = [1]; a[0] = 2; const b = [1]; b.push(2); const c = [[1]]; c[0].splice(0, 1); const d = [1]; d['sort']();"
        },
        {
            name: "wrapped mutating array methods are ignored",
            code: "const items = [1]; items.push!(2);"
        }
    ],
    invalid: [
        {
            name: "mutating an array returned by a method does not mutate the original",
            code: "const items = [1]; items.slice().push(2);",
            output: "const items = [1] as const; items.slice().push(2);",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "mutations through an alias are not tracked",
            code: "const items = [1]; const alias = items; alias.push(2);",
            output: "const items = [1] as const; const alias = items; alias.push(2);",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "const arrays used for mapping require as const",
            code: "const items = [1, 2]; items.map(fn);",
            output: "const items = [1, 2] as const; items.map(fn);",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "wrapped arrays require as const",
            code: "const items = ([1, 2]) satisfies readonly number[];",
            output: "const items = ([1, 2] as const) satisfies readonly number[];",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        }
    ]
});
