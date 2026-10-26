import { describe, it } from "vitest";
import { RuleTester } from "oxlint/plugins-dev";
import { objectNewlineRule } from "./objectNewline.ts";

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

ruleTester.run("object-newline JSX props", objectNewlineRule, {
    valid: [
        {
            name: "empty JSX prop objects do not require newlines",
            code: "const element = <Example options={{}} />;"
        },
        {
            name: "one-property JSX prop objects remain below the threshold",
            code: "const element = <Example options={{a: 1}} />;"
        },
        {
            name: "two longhand properties remain below the JSX prop threshold",
            code: "const element = <Example options={{a: 1,b: 2}} />;"
        },
        {
            name: "shorthand and spreads do not count toward the JSX prop threshold",
            code: "const element = <Example options={{...defaults,a: 1,b: 2,bodyHast,locale,title}} />;"
        },
        {
            name: "transparent wrappers preserve JSX prop context",
            code: "const element = <Example options={(({a: 1,b: 2} as const) satisfies Options)!} />;"
        },
        {
            name: "existing JSX prop newlines and indentation remain untouched below the threshold",
            code: "const element = <Example options={{\n a: 1,\n\n        b: 2\n}} />;"
        },
        {
            name: "three longhand JSX prop properties comply when expanded",
            code: "const element = <Example options={{\na: 1,\nb: 2,\nc: 3\n}} />;"
        }
    ],
    invalid: [
        {
            name: "three longhand properties reach the JSX prop threshold",
            code: "const element = <Example options={{a: 1,b: 2,c: 3}} />;",
            output: "const element = <Example options={{\na: 1,\nb: 2,\nc: 3\n}} />;",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "more than three longhand JSX prop properties also require newlines",
            code: "const element = <Example options={{a: 1,b: 2,c: 3,d: 4}} />;",
            output: "const element = <Example options={{\na: 1,\nb: 2,\nc: 3,\nd: 4\n}} />;",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "wrapped JSX props still expand at the threshold",
            code: "const element = <Example options={(({a: 1,b: 2,c: 3} as const) satisfies Options)!} />;",
            output: "const element = <Example options={(({\na: 1,\nb: 2,\nc: 3\n} as const) satisfies Options)!} />;",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "the JSX prop exemption does not extend to nested property values",
            code: "const element = <Example options={{nested: {a: 1}}} />;",
            output: "const element = <Example options={{nested: {\na: 1\n}}} />;",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "array elements inside JSX props are not direct prop values",
            code: "const element = <Example options={[{a: 1,b: 2}]} />;",
            output: "const element = <Example options={[{\na: 1,\nb: 2\n}]} />;",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "JSX children do not receive the prop exemption",
            code: "const element = <Example>{{a: 1,b: 2}}</Example>;",
            output: "const element = <Example>{{\na: 1,\nb: 2\n}}</Example>;",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "JSX spread attributes are not objects passed as individual prop values",
            code: "const element = <Example {...{a: 1,b: 2}} />;",
            output: "const element = <Example {...{\na: 1,\nb: 2\n}} />;",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "conditional objects in JSX props are not direct prop values",
            code: "const element = <Example options={condition ? {a: 1} : undefined} />;",
            output: "const element = <Example options={condition ? {\na: 1\n} : undefined} />;",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        }
    ]
});
