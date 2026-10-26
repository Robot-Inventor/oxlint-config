import { describe, it } from "vitest";
import { RuleTester } from "oxlint/plugins-dev";
import { controlFlowBracesRule } from "./controlFlowBraces.ts";

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

const loopHeaders = [
    "for (;;)",
    "for (const key in source)",
    "for (const value of source)",
    "for await (const value of source)",
    "while (ready)"
];

ruleTester.run("control-flow-braces loops and layout", controlFlowBracesRule, {
    valid: [
        ...loopHeaders.map((header) => `${header} {\nwork();\n}`),
        ...loopHeaders.map((header) => ({
            name: `${header} delegates multiline unbraced bodies to curly`,
            code: `${header}\nwork();`
        })),
        {
            name: "multiline statement bodies are delegated to curly",
            code: "for (;;) work(\nvalue\n);"
        },
        {
            name: "multiline do-while bodies are delegated to curly",
            code: "do\nwork(); while (ready);"
        },
        {
            name: "multiline if bodies are delegated to curly",
            code: "if (ready)\nwork();"
        },
        {
            name: "expanded do-while bodies are preserved",
            code: "do {\nwork();\n} while (ready);"
        },
        {
            name: "empty multiline blocks are preserved",
            code: "for (;;) {\n}"
        },
        {
            name: "CRLF line breaks are preserved",
            code: "while (ready) {\r\nwork();\r\n}"
        },
        {
            name: "statement separators and indentation are not audited",
            code: "if (ready) {\n  first(); second();\n}"
        },
        {
            name: "function and standalone blocks are outside the rule",
            code: "function work() { run(); } { work(); } const arrow = () => { work(); };"
        }
    ],
    invalid: [
        ...loopHeaders.flatMap((header) => [
            {
                name: `${header} requires a block for an inline statement`,
                code: `${header} work();`,
                output: `${header} {\nwork();\n}`,
                errors: [
                    {
                        messageId: "expectedBlock"
                    }
                ]
            },
            {
                name: `${header} expands inline blocks`,
                code: `${header} {work();}`,
                output: `${header} {\nwork();\n}`,
                errors: [
                    {
                        messageId: "expectedNewlines"
                    }
                ]
            }
        ]),
        {
            name: "do-while requires a block for an inline statement",
            code: "do work(); while (ready);",
            output: "do {\nwork();\n} while (ready);",
            errors: [
                {
                    messageId: "expectedBlock"
                }
            ]
        },
        {
            name: "do-while expands inline blocks",
            code: "do {work();} while (ready);",
            output: "do {\nwork();\n} while (ready);",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "loop returns are not exempt",
            code: "function work() { while (ready) return; }",
            output: "function work() { while (ready) {\nreturn;\n} }",
            errors: [
                {
                    messageId: "expectedBlock"
                }
            ]
        },
        {
            name: "loop throws are not exempt even when already braced",
            code: "for (;;) {throw failure;}",
            output: "for (;;) {\nthrow failure;\n}",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "empty blocks get one newline, not two",
            code: "while (ready) {}",
            output: "while (ready) {\n}",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "empty statements remain inside the new block",
            code: "for (;;);",
            output: "for (;;){\n;\n}",
            errors: [
                {
                    messageId: "expectedBlock"
                }
            ]
        },
        {
            name: "only the missing opening newline is added",
            code: "if (ready) {work();\n}",
            output: "if (ready) {\nwork();\n}",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "only the missing closing newline is added",
            code: "if (ready) {\nwork();}",
            output: "if (ready) {\nwork();\n}",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "comments at block boundaries are preserved",
            code: "if (ready) {/* before */work();/* after */}",
            output: "if (ready) {\n/* before */work();/* after */\n}",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "a trailing line comment is not swallowed by the closing brace",
            code: "if (ready) work(); // keep\nnext();",
            output: "if (ready) {\nwork();\n} // keep\nnext();",
            errors: [
                {
                    messageId: "expectedBlock"
                }
            ]
        },
        {
            name: "a multiline header still requires braces for an inline body",
            code: "for (\n;;\n) work();",
            output: "for (\n;;\n) {\nwork();\n}",
            errors: [
                {
                    messageId: "expectedBlock"
                }
            ]
        },
        {
            name: "a multiline comment before an inline body does not hide a violation",
            code: "if (ready) /* before\n after */ work();",
            output: "if (ready) /* before\n after */ {\nwork();\n}",
            errors: [
                {
                    messageId: "expectedBlock"
                }
            ]
        },
        {
            name: "a semicolon on the next line does not hide an inline body",
            code: "if (ready) work()\n;",
            output: "if (ready) {\nwork()\n;\n}",
            errors: [
                {
                    messageId: "expectedBlock"
                }
            ]
        }
    ]
});
