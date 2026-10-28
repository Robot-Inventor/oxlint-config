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

ruleTester.run("require-as-const", requireAsConstRule, {
    valid: [
        {
            name: "as const is already attached",
            code: "const hoge = {foo: 1} as const;"
        },
        {
            name: "as const inside satisfies is recognized",
            code: "const hoge = ({foo: 1} as const) satisfies Options;"
        },
        {
            name: "assignment into a member exempts the object",
            code: 'const hoge = {foo: "foo"}; hoge.foo = "bar";'
        },
        {
            name: "compound assignment into a member exempts the object",
            code: "const hoge = {foo: 1}; hoge.foo += 1;"
        },
        {
            name: "update expressions on members exempt the object",
            code: "const hoge = {foo: 1}; hoge.foo++;"
        },
        {
            name: "delete on a member exempts the object",
            code: "const hoge = {foo: 1}; delete hoge.foo;"
        },
        {
            name: "optional-chain deletion exempts the object",
            code: "const defaults: {foo?: number} = {foo: 1}; const hoge = {...defaults}; delete hoge?.foo;"
        },
        {
            name: "reassignment exempts the object",
            code: 'const hoge = {foo: "foo"}; hoge = {foo: "bar"};'
        },
        {
            name: "computed member assignment exempts the object",
            code: "const hoge = {foo: 1}; hoge[0] = 1;"
        },
        {
            name: "assignment into a nested member exempts the object",
            code: "const hoge = {foo: {bar: 1}}; hoge.foo.bar = 2;"
        },
        {
            name: "assignment inside a function exempts the object",
            code: 'const hoge = {foo: "foo"}; function update() { hoge.foo = "bar"; }'
        },
        {
            name: "destructuring assignment targets exempt the object",
            code: "const hoge = {foo: 1}; ({bar: hoge.baz} = options);"
        },
        {
            name: "array pattern destructuring assignment targets exempt the object",
            code: "const hoge = {foo: 1}; ([hoge.baz] = options);"
        },
        {
            name: "parenthesized member assignment targets exempt the object",
            code: "const hoge = {foo: 1}; delete (hoge.foo); void (hoge.bar = 1);"
        },
        {
            name: "for-of member targets exempt the object",
            code: "const hoge = {foo: 1}; for (hoge.foo of list) {}"
        },
        {
            name: "for-in member targets exempt the object",
            code: 'const hoge = {foo: ""}; for (hoge.foo in values) {}'
        },
        {
            name: "non-null assertions in assignment targets exempt the object",
            code: "const hoge = {foo: 1}; hoge!.foo = 2;"
        },
        {
            name: "type assertions in assignment targets exempt the object",
            code: "const hoge = {foo: 1}; (hoge as Options).foo = 2;"
        },
        {
            name: "destructuring defaults in assignment targets exempt the object",
            code: "const hoge = {foo: 1}; ({foo: hoge.foo = 2} = options);"
        },
        {
            name: "destructuring rest targets exempt the object",
            code: "const hoge = {foo: []}; ([...hoge.foo] = values);"
        },
        {
            name: "let declarations are outside the rule",
            code: 'let hoge = {foo: "foo"};'
        },
        {
            name: "type annotations exempt the object",
            code: "const hoge: Options = {foo: 1};"
        },
        {
            name: "explicit type assertions exempt the object",
            code: "const hoge = {foo: 1} as Options; const piyo = <Options>{foo: 1};",
            filename: "example.ts"
        },
        {
            name: "non-object initial values are outside the rule",
            code: "const piyo = 1; const piyo2 = null; const piyo3 = () => {};"
        },
        {
            name: "destructuring declarations are outside the rule",
            code: "const {hoge} = {foo: 1}; const [piyo] = [1];"
        },
        {
            name: "object literals in other positions are outside the rule",
            code: "function get() { return {foo: 1}; } fn({foo: 1});"
        }
    ],
    invalid: [
        {
            name: "using an object as a computed key does not mutate it",
            code: "const hoge = {foo: 1}; target[hoge.foo] = 2;",
            output: "const hoge = {foo: 1} as const; target[hoge.foo] = 2;",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "iteration over an object does not mutate it",
            code: "const hoge = {foo: 1}; for (const key in hoge) {}",
            output: "const hoge = {foo: 1} as const; for (const key in hoge) {}",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "wrapped reads do not exempt the object",
            code: "const hoge = {foo: 1}; consume((hoge as Options).foo);",
            output: "const hoge = {foo: 1} as const; consume((hoge as Options).foo);",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "plain const object literals require as const",
            code: "const hoge = {foo: 1};",
            output: "const hoge = {foo: 1} as const;",
            errors: [
                {
                    messageId: "expectedAsConst",
                    line: 1,
                    column: 6
                }
            ]
        },
        {
            name: "read-only usage does not exempt the object",
            code: 'const hoge = {foo: "foo"}; log(hoge.foo);',
            output: 'const hoge = {foo: "foo"} as const; log(hoge.foo);',
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "reads inside functions do not exempt the object",
            code: 'const hoge = {foo: "foo"}; function get() { return hoge.foo; }',
            output: 'const hoge = {foo: "foo"} as const; function get() { return hoge.foo; }',
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "satisfies wrappers still require as const",
            code: "const hoge = {foo: 1} satisfies Options;",
            output: "const hoge = {foo: 1} as const satisfies Options;",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "parenthesized objects are fixed without breaking the parentheses",
            code: "const hoge = ({foo: 1});",
            output: "const hoge = ({foo: 1} as const);",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "non-null assertion wrappers still require as const",
            code: "const hoge = ({foo: 1})!;",
            output: "const hoge = ({foo: 1} as const)!;",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "exported const object literals require as const",
            code: "export const hoge = {foo: 1};",
            output: "export const hoge = {foo: 1} as const;",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "each declarator in one declaration is audited independently",
            code: 'const hoge = {foo: 1}, piyo = {foo: 2}; piyo.foo = "bar";',
            output: 'const hoge = {foo: 1} as const, piyo = {foo: 2}; piyo.foo = "bar";',
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "writes to a shadowed variable do not exempt the outer object",
            code: "const hoge = {foo: 1}; { let hoge; hoge = {foo: 2}; }",
            output: "const hoge = {foo: 1} as const; { let hoge; hoge = {foo: 2}; }",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "comments after the closing brace are kept",
            code: "const hoge = {foo: 1} /* trailing */;",
            output: "const hoge = {foo: 1} as const /* trailing */;",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        },
        {
            name: "nested declarations are fixed independently",
            code: "function get() { const hoge = {foo: 1}; return hoge; }",
            output: "function get() { const hoge = {foo: 1} as const; return hoge; }",
            errors: [
                {
                    messageId: "expectedAsConst"
                }
            ]
        }
    ]
});
