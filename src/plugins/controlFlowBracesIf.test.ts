import { describe, it } from "vitest";
import { RuleTester } from "oxlint/plugins-dev";
import { controlFlowBracesRule } from "./controlFlowBraces.ts";

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

ruleTester.run("control-flow-braces if and exits", controlFlowBracesRule, {
    valid: [
        {
            name: "standalone direct returns, bare returns, and throws remain inline",
            code: "function get() { if (first) return null; if (second) return; if (third) throw failure; work(); }"
        },
        {
            name: "braced single returns and throws are never unwrapped or reformatted",
            code: "function get() { if (first) { return null; } if (second) { throw failure; } }"
        },
        {
            name: "single breaks and continues, including labeled and braced exits, remain inline",
            code: "outer: for (;;) {\nif (a) continue; if (b) break; if (c) { continue outer; } if (d) { break outer; }\n}"
        },
        {
            name: "expanded exits remain expanded",
            code: "function get() { if (ready) {\nreturn null;\n} }"
        },
        {
            name: "multiline direct returns are left to curly",
            code: "function get() { if (ready) return {\nvalue: 1\n}; }"
        },
        {
            name: "expanded if-else chains remain unchanged",
            code: "if (first) {\nwork();\n} else if (second) {\nthrow failure;\n} else {\nfinish();\n}"
        },
        {
            name: "an independent nested guard retains its exit exemption",
            code: "function get() { if (first) {\nif (second) return null;\n} else {\nwork();\n} }"
        }
    ],
    invalid: [
        {
            name: "breaks and continues in if-else branches still require blocks",
            code: "for (;;) {\nif (ready) continue; else break;\n}",
            output: "for (;;) {\nif (ready) {\ncontinue;\n} else {\nbreak;\n}\n}",
            errors: [{ messageId: "expectedBlock" }, { messageId: "expectedBlock" }]
        },
        {
            name: "a block with work before a break still requires newlines",
            code: "for (;;) {\nif (ready) {work(); break;}\n}",
            output: "for (;;) {\nif (ready) {\nwork(); break;\n}\n}",
            errors: [{ messageId: "expectedNewlines" }]
        },
        {
            name: "ordinary if statements require a block",
            code: "if (ready) work();",
            output: "if (ready) {\nwork();\n}",
            errors: [
                {
                    messageId: "expectedBlock"
                }
            ]
        },
        {
            name: "an if with work before a return does not get the exit exemption",
            code: "function get() { if (ready) {work(); return null;} }",
            output: "function get() { if (ready) {\nwork(); return null;\n} }",
            errors: [
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "both branches of if-else require blocks even for exits",
            code: "function get() { if (ready) return null; else throw failure; }",
            output: "function get() { if (ready) {\nreturn null;\n} else {\nthrow failure;\n} }",
            errors: [
                {
                    messageId: "expectedBlock"
                },
                {
                    messageId: "expectedBlock"
                }
            ]
        },
        {
            name: "both branches require newlines even for braced exits",
            code: "function get() { if (ready) {return null;} else {throw failure;} }",
            output: "function get() { if (ready) {\nreturn null;\n} else {\nthrow failure;\n} }",
            errors: [
                {
                    messageId: "expectedNewlines"
                },
                {
                    messageId: "expectedNewlines"
                }
            ]
        },
        {
            name: "else-if chains require blocks even without a final else",
            code: "function get() { if (first) return null; else if (second) return; }",
            output: "function get() { if (first) {\nreturn null;\n} else if (second) {\nreturn;\n} }",
            errors: [
                {
                    messageId: "expectedBlock"
                },
                {
                    messageId: "expectedBlock"
                }
            ]
        },
        {
            name: "else-if chains preserve their structure while expanding every branch",
            code: "if (first) work(); else if (second) throw failure; else finish();",
            output: "if (first) {\nwork();\n} else if (second) {\nthrow failure;\n} else {\nfinish();\n}",
            errors: [
                {
                    messageId: "expectedBlock"
                },
                {
                    messageId: "expectedBlock"
                },
                {
                    messageId: "expectedBlock"
                }
            ]
        },
        {
            name: "an inline else is checked when the if branch is already expanded",
            code: "if (ready) {\nwork();\n} else finish();",
            output: "if (ready) {\nwork();\n} else {\nfinish();\n}",
            errors: [
                {
                    messageId: "expectedBlock"
                }
            ]
        },
        {
            name: "nested ifs are not treated as direct exits",
            code: "function get() { if (first) if (second) return; }",
            output: "function get() { if (first) {\nif (second) return;\n} }",
            errors: [
                {
                    messageId: "expectedBlock"
                }
            ]
        },
        {
            name: "nested fixes preserve the dangling else association",
            code: "if (first) if (second) work(); else finish();",
            output: "if (first) {\nif (second) {\nwork();\n} else {\nfinish();\n}\n}",
            errors: [
                {
                    messageId: "expectedBlock"
                },
                {
                    messageId: "expectedBlock"
                },
                {
                    messageId: "expectedBlock"
                }
            ]
        }
    ]
});
