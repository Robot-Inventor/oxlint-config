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

ruleTester.run("object-newline inline uses", objectNewlineRule, {
    valid: [
        {
            name: "the existing map projection can stay inline",
            code: "expect(result.blocks.map(({ depth, end, kind, start }) => ({ depth, end, kind, start }))).toEqual([]);"
        },
        {
            name: "method receivers do not require newlines even with three longhand properties",
            code: "({a: 1,b: 2,c: 3,fn() {}}).fn();"
        },
        {
            name: "computed method calls receive the same exemption",
            code: "({a: 1,b: 2,c: 3})[method]();"
        },
        {
            name: "optional method calls receive the same exemption",
            code: "({a: 1,b: 2,c: 3})?.fn?.();"
        },
        {
            name: "parenthesized optional method access preserves the receiver exemption when called",
            code: "(({a: 1,b: 2,c: 3})?.fn)();"
        },
        {
            name: "implicit callback returns do not require newlines even with three longhand properties",
            code: "items.map(() => ({a: 1,b: 2,c: 3}));"
        },
        {
            name: "inline callbacks are not restricted to specific method names",
            code: "process(() => ({a: 1,b: 2,c: 3,d: 4}));"
        },
        {
            name: "constructor callback arguments receive the same exemption",
            code: "new Pipeline(() => ({a: 1,b: 2,c: 3}));"
        },
        {
            name: "wrappers around a method receiver and callee preserve the exemption",
            code: "((({a: 1,b: 2,c: 3} as Options).fn) as Callable)();"
        },
        {
            name: "wrappers around a callback and its implicit return preserve the exemption",
            code: "process((() => (({a: 1,b: 2,c: 3} as const) satisfies Options)) as Mapper);"
        },
        {
            name: "existing method receiver newlines and whitespace remain untouched",
            code: "({\n a: 1,\n\n        b: 2,\n c: 3\n}).fn();"
        },
        {
            name: "existing callback return newlines and whitespace remain untouched",
            code: "items.map(() => ({\n a: 1,\n\n        b: 2,\n c: 3\n}));"
        }
    ],
    invalid: [
        {
            name: "property access without a method call is not exempt",
            code: "const result = ({a: 1}).value;",
            output: "const result = ({\na: 1\n}).value;",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "passing a method reference does not call it on the literal",
            code: "consume(({a: 1}).fn);",
            output: "consume(({\na: 1\n}).fn);",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "passing optional method access as an argument is not a method call on the literal",
            code: "consume(({a: 1})?.fn);",
            output: "consume(({\na: 1\n})?.fn);",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "an object used as a computed key is not the method receiver",
            code: "items[{a: 1}].fn();",
            output: "items[{\na: 1\n}].fn();",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "explicit returns from callback blocks still require newlines",
            code: "items.map(() => { return {a: 1}; });",
            output: "items.map(() => { return {\na: 1\n}; });",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "a separately defined callback does not receive the inline exemption",
            code: "const mapper = () => ({a: 1}); items.map(mapper);",
            output: "const mapper = () => ({\na: 1\n}); items.map(mapper);",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "nested values inside an implicit callback return remain independently audited",
            code: "items.map(() => ({nested: {a: 1}}));",
            output: "items.map(() => ({nested: {\na: 1\n}}));",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "nested values inside a method receiver remain independently audited",
            code: "({nested: {a: 1},fn() {}}).fn();",
            output: "({nested: {\na: 1\n},fn() {}}).fn();",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "an immediately invoked arrow is not passed as a callback argument",
            code: "(() => ({a: 1}))();",
            output: "(() => ({\na: 1\n}))();",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        }
    ]
});
