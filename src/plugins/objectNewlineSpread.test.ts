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

ruleTester.run("object-newline spread-only objects", objectNewlineRule, {
    valid: [
        {
            name: "a single spread does not require newlines in a definition",
            code: "const hoge = { ...document };"
        },
        {
            name: "multiple spreads do not require newlines in a definition",
            code: "const hoge = { ...document, ...foo };"
        },
        {
            name: "more than three spreads still do not require newlines",
            code: "const hoge = {...document,...foo,...bar,...baz};"
        },
        {
            name: "spread-only ordinary returns do not require newlines",
            code: "function get() { return {...document,...foo}; }"
        },
        {
            name: "spread-only braced guard returns do not require newlines",
            code: "function get() { if (flag) { return {...document,...foo}; } return fallback; }"
        },
        {
            name: "spread-only array elements do not require newlines",
            code: "const list = [{...document,...foo}];"
        },
        {
            name: "spread-only nested values do not require newlines",
            code: "const hoge = {\nvalue: {...document,...foo}\n};"
        },
        {
            name: "existing spread-only newlines, comments and indentation remain untouched",
            code: "const hoge = {\n ...document, // keep\n\n        ...foo\n};"
        },
        {
            name: "mixed function arguments retain their existing below-threshold exemption",
            code: 'fn({...document,foo: "bar"});'
        }
    ],
    invalid: [
        {
            name: "a spread mixed with a key-value property still requires newlines in a definition",
            code: 'const hoge = {...document,foo: "bar"};',
            output: 'const hoge = {\n...document,\nfoo: "bar"\n};',
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "a spread mixed with a shorthand property is not spread-only",
            code: "const hoge = {...document,foo};",
            output: "const hoge = {\n...document,\nfoo\n};",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "a spread mixed with a method is not spread-only",
            code: "const hoge = {...document,method() {}};",
            output: "const hoge = {\n...document,\nmethod() {}\n};",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "a key-value property after multiple spreads still requires newlines",
            code: "const hoge = {...document,...foo,...bar,value: 1};",
            output: "const hoge = {\n...document,\n...foo,\n...bar,\nvalue: 1\n};",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "the spread-only exemption does not exempt the surrounding mixed object",
            code: "const hoge = {value: {...document,...foo}};",
            output: "const hoge = {\nvalue: {...document,...foo}\n};",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "an object inside a spread expression is still audited independently",
            code: "const hoge = {...{value: 1},...foo};",
            output: "const hoge = {...{\nvalue: 1\n},...foo};",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        }
    ]
});
