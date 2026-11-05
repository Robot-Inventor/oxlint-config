import { describe, it } from "vitest";
import { RuleTester } from "oxlint/plugins-dev";
import { groupExportsRule } from "./groupExports.ts";

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

ruleTester.run("group-exports", groupExportsRule, {
    valid: [
        "const foo = 1;",
        "export {};",
        "const foo = 1; export { foo };",
        "type Hoge = string; export type { Hoge };",
        "type Hoge = string; export { type Hoge };",
        "const foo = 1; type Hoge = string; export { foo, type Hoge };",
        "const foo = 1; export { foo as default };",
        "const foo = 1; export default foo;",
        "export default function foo() {}",
        "export default class {}",
        'export { foo } from "./source"; export { bar } from "./source";',
        'export * from "./source"; export type { Hoge } from "./source";',
        "const foo = 1; export = foo;",
        "namespace Outer { export const foo = 1; export function bar() {} }",
        'declare module "source" { export const foo: number; export interface Hoge {} }',
        ...["file.d.ts", "file.d.mts", "file.d.cts"].map((filename) => ({
            filename,
            code: "export const foo: number; export function bar(): void;"
        }))
    ],
    invalid: [
        {
            name: "combines value and declaration-level type exports without sorting",
            code: "const foo = 1, bar = 2; type Hoge = string;\nexport { bar };\nexport { foo };\nexport type { Hoge };",
            output: "const foo = 1, bar = 2; type Hoge = string;\n\n\n\nexport { bar, foo, type Hoge };"
        },
        {
            name: "preserves aliases, inline type modifiers and string export names",
            code: 'const foo = 1; type Hoge = string;\nexport { foo as "public-name" };\nexport { type Hoge as PublicType };',
            output: 'const foo = 1; type Hoge = string;\n\n\nexport { foo as "public-name", type Hoge as PublicType };'
        },
        {
            name: "combines type-only lists using inline type specifiers",
            code: "type Foo = string; type Bar = number;\nexport type { Foo };\nexport type { Bar as Baz };",
            output: "type Foo = string; type Bar = number;\n\n\nexport { type Foo, type Bar as Baz };"
        },
        {
            name: "separates a single declaration even without another export",
            code: "export const foo = 1;",
            output: "const foo = 1;\nexport { foo };"
        },
        {
            name: "keeps declarations in execution order and appends the list",
            code: "export const foo = run();\nwork();\nexport function bar(arg: string) { return arg; }\nfinish();",
            output: "const foo = run();\nwork();\nfunction bar(arg: string) { return arg; }\nfinish();\nexport { foo, bar };"
        },
        {
            name: "gets every binding from multiple declarators and nested destructuring",
            code: "export const { foo: renamed, nested: [first = 1, , ...rest], ...other } = source, bar = 2;",
            output: "const { foo: renamed, nested: [first = 1, , ...rest], ...other } = source, bar = 2;\nexport { renamed, first, rest, other, bar };"
        },
        {
            name: "does not infer type modifiers for separated type declarations",
            code: "export type Hoge = string;\nexport interface Fuga {}",
            output: "type Hoge = string;\ninterface Fuga {}\nexport { Hoge, Fuga };"
        },
        {
            name: "separates classes, enums and namespaces without touching nested exports",
            code: "export abstract class Foo {}\nexport enum Bar { First }\nexport namespace Baz { export const nested = 1; }",
            output: "abstract class Foo {}\nenum Bar { First }\nnamespace Baz { export const nested = 1; }\nexport { Foo, Bar, Baz };"
        },
        {
            name: "exports the outer binding of a dotted namespace",
            code: "export namespace Foo.Bar { export const nested = 1; }",
            output: "namespace Foo.Bar { export const nested = 1; }\nexport { Foo };"
        },
        {
            name: "preserves declare, async and generator modifiers",
            code: "export declare const foo: number;\nexport async function* bar(arg: number) { yield arg; }",
            output: "declare const foo: number;\nasync function* bar(arg: number) { yield arg; }\nexport { foo, bar };"
        },
        {
            name: "deduplicates overload and merged declaration bindings",
            code: "export function foo(arg: string): string;\nexport function foo(arg: number): number;\nexport function foo(arg: string | number) { return arg; }\nexport interface Foo {}\nexport namespace Foo {}",
            output: "function foo(arg: string): string;\nfunction foo(arg: number): number;\nfunction foo(arg: string | number) { return arg; }\ninterface Foo {}\nnamespace Foo {}\nexport { foo, Foo };"
        },
        {
            name: "combines existing lists and declarations",
            code: "const foo = 1;\nexport { foo as default };\nexport const bar = 2;",
            output: "const foo = 1;\n\nconst bar = 2;\nexport { foo as default, bar };"
        },
        {
            name: "does not include defaults or reexports in the local list",
            code: 'export default function main() {}\nexport { remote } from "./remote";\nexport const foo = 1;',
            output: 'export default function main() {}\nexport { remote } from "./remote";\nconst foo = 1;\nexport { foo };'
        },
        {
            name: "preserves JSDoc and comments within declarations",
            code: "/** Public function. */\nexport function foo() { /* body */ return 1; } // trailing",
            output: "/** Public function. */\nfunction foo() { /* body */ return 1; } // trailing\nexport { foo };"
        },
        {
            name: "supports decorators before the export keyword",
            code: "@decorator export class Foo {}",
            output: "@decorator class Foo {}\nexport { Foo };"
        },
        {
            name: "supports decorators after the export keyword",
            code: "export @decorator class Foo {}",
            output: "@decorator class Foo {}\nexport { Foo };"
        },
        {
            name: "retains ASI boundaries between calls and array expressions",
            code: "const foo = 1\nrun()\nexport { foo }\n[1].forEach(work)\nexport const bar = 2",
            output: "const foo = 1\nrun()\n;\n[1].forEach(work)\nconst bar = 2\nexport { foo, bar };"
        },
        {
            name: "preserves module semantics for multiple empty exports",
            code: "export {};\nexport {};",
            output: "\n\nexport {  };"
        },
        {
            name: "uses CRLF when appending to a CRLF file",
            code: "export const foo = 1;\r\nexport const bar = 2;\r\n",
            output: "const foo = 1;\r\nconst bar = 2;\r\n\r\nexport { foo, bar };"
        },
        {
            name: "reports lists with internal comments without discarding them",
            code: "const foo = 1, bar = 2;\nexport { /* public */ foo };\nexport { bar };",
            output: null
        },
        {
            name: "does not move attached leading list comments",
            code: "const foo = 1, bar = 2;\n// Public API\nexport { foo };\nexport { bar };",
            output: null
        },
        {
            name: "does not detach trailing list comments",
            code: "const foo = 1, bar = 2;\nexport { foo }; // Public API\nexport { bar };",
            output: null
        },
        {
            name: "does not remove comments between export and the declaration",
            code: "export /* public */ const foo = 1;",
            output: null
        }
    ].map((test) => ({
        ...test,
        errors: [
            {
                messageId: "groupExports"
            }
        ]
    }))
});
