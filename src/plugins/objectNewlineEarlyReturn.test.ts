import { describe, it } from "vitest";
import { RuleTester } from "oxlint/plugins-dev";
import { objectNewlineRule } from "./objectNewline.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            lang: "ts"
        }
    },
    recursive: true
});

ruleTester.run("object-newline early returns", objectNewlineRule, {
    valid: [
        {
            name: "empty early returns remain unchanged",
            code: "function get() { if (!item) return {}; return item; }"
        },
        {
            name: "one longhand property remains below the early-return threshold",
            code: 'function get() { if (!item) return {type: "error"}; return item; }'
        },
        {
            name: "two longhand properties remain below the early-return threshold",
            code: 'function get() { if (!item) return {type: "error",message: "missing"}; return item; }'
        },
        {
            name: "the existing spread-and-override early-return pattern remains unchanged",
            code: "function get() { if (!hasWhere(args)) return {...args,where: DEFAULT_FILTER}; return args; }"
        },
        {
            name: "shorthand and spreads do not count toward the early-return threshold",
            code: "function get() { if (flag) return {...args,a: 1,b: 2,title,locale}; return args; }"
        },
        {
            name: "shorthand-only early returns do not require newlines",
            code: "function get() { if (flag) return {bodyHast,locale,title}; return fallback; }"
        },
        {
            name: "existing below-threshold early-return newlines and indentation remain untouched",
            code: "function get() { if (flag) return {\n a: 1,\n\n        b: 2\n}; return fallback; }"
        },
        {
            name: "TypeScript wrappers preserve early-return context",
            code: "function get() { if (flag) return (({a: 1,b: 2} as const) satisfies Result)!; return fallback; }"
        },
        {
            name: "three longhand early-return properties comply when expanded",
            code: "function get() { if (flag) return {\na: 1,\nb: 2,\nc: 3\n}; return fallback; }"
        }
    ],
    invalid: [
        {
            name: "three longhand properties reach the early-return threshold",
            code: "function get() { if (flag) return {a: 1,b: 2,c: 3}; return fallback; }",
            output: "function get() { if (flag) return {\na: 1,\nb: 2,\nc: 3\n}; return fallback; }",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "more than three longhand early-return properties also require newlines",
            code: "function get() { if (flag) return {a: 1,b: 2,c: 3,d: 4}; return fallback; }",
            output: "function get() { if (flag) return {\na: 1,\nb: 2,\nc: 3,\nd: 4\n}; return fallback; }",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "additional shorthand and spreads do not hide three longhand early-return properties",
            code: "function get() { if (flag) return {...args,a: 1,title,b: 2,c: 3}; return fallback; }",
            output: "function get() { if (flag) return {\n...args,\na: 1,\ntitle,\nb: 2,\nc: 3\n}; return fallback; }",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "wrapped early returns still expand at the threshold",
            code: "function get() { if (flag) return ({a: 1,b: 2,c: 3} as const) satisfies Result; return fallback; }",
            output: "function get() { if (flag) return ({\na: 1,\nb: 2,\nc: 3\n} as const) satisfies Result; return fallback; }",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "braced if returns with three properties still require newlines",
            code: "function get() { if (flag) { return {a: 1,b: 2,c: 3}; } return fallback; }",
            output: "function get() { if (flag) { return {\na: 1,\nb: 2,\nc: 3\n}; } return fallback; }",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "braced if returns require newlines even below the threshold",
            code: "function get() { if (flag) { log(); return {a: 1,b: 2}; } return fallback; }",
            output: "function get() { if (flag) { log(); return {\na: 1,\nb: 2\n}; } return fallback; }",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "the early-return exemption does not extend to nested property values",
            code: "function get() { if (flag) return {nested: {a: 1}}; return fallback; }",
            output: "function get() { if (flag) return {nested: {\na: 1\n}}; return fallback; }",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "ordinary returns after a guard still require newlines",
            code: "function get() { if (!flag) return fallback; return {a: 1,b: 2}; }",
            output: "function get() { if (!flag) return fallback; return {\na: 1,\nb: 2\n}; }",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "returns from callbacks nested inside an if are not guard-clause returns",
            code: "if (flag) fn(() => { return {a: 1,b: 2}; });",
            output: "if (flag) fn(() => { return {\na: 1,\nb: 2\n}; });",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "else returns do not receive the guard-clause exemption",
            code: "function get() { if (flag) return {a: 1}; else return {b: 2}; }",
            output: "function get() { if (flag) return {a: 1}; else return {\nb: 2\n}; }",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        }
    ]
});
