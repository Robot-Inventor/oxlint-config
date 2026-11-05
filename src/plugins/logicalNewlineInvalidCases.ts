const invalidCases = [
    {
        name: "a same-line pair converges over fix passes, leaving alignment to oxfmt",
        code: "function work() {\nwork(); return;\n}",
        output: "function work() {\nwork();\n\n return;\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a plain return requires a blank line after statements",
        code: "function work() {\nconst a = prepare();\nreturn a;\n}",
        output: "function work() {\nconst a = prepare();\n\nreturn a;\n}",
        errors: [
            {
                messageId: "expectedBlankLine",
                line: 3
            }
        ]
    },
    {
        name: "a plain throw requires a blank line after statements",
        code: 'function work() {\nconst data = parse(input);\nthrow new Error("invalid");\n}',
        output: 'function work() {\nconst data = parse(input);\n\nthrow new Error("invalid");\n}',
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a guard clause group ends with a blank line",
        code: "function work() {\nif (!ready) return null;\nconst result = compute();\n}",
        output: "function work() {\nif (!ready) return null;\n\nconst result = compute();\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a block is followed by a blank line",
        code: "function work() {\nif (ready) {\nwork();\n}\nnext();\n}",
        output: "function work() {\nif (ready) {\nwork();\n}\n\nnext();\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a multiline return value needs one blank line, not two",
        code: "function work() {\nconst total = items.reduce(\n(sum, item) => sum + item,\n0\n);\nreturn total;\n}",
        output: "function work() {\nconst total = items.reduce(\n(sum, item) => sum + item,\n0\n);\n\nreturn total;\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a plain return after a guard clause still requires a blank line",
        code: "function work() {\nif (!ready) return null;\nreturn fallback;\n}",
        output: "function work() {\nif (!ready) return null;\n\nreturn fallback;\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "consecutive plain returns also require a blank line",
        code: "function work() {\nreturn 1;\nreturn 2;\n}",
        output: "function work() {\nreturn 1;\n\nreturn 2;\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a blank line is required before a comment attached to the next statement",
        code: "function work() {\nconst a = prepare();\n// Use the prepared value.\nreturn a;\n}",
        output: "function work() {\nconst a = prepare();\n\n// Use the prepared value.\nreturn a;\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a trailing comment does not hide a missing blank line",
        code: "function work() {\nprepare(); // Get ready.\nreturn;\n}",
        output: "function work() {\nprepare(); // Get ready.\n\nreturn;\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a multiline trailing comment ends the previous statement's group",
        code: "function work() {\nprepare(); /* multi\nline */\nreturn;\n}",
        output: "function work() {\nprepare(); /* multi\nline */\n\nreturn;\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a multiline trailing comment extends the group before a leading comment",
        code: "function work() {\nprepare(); /* multi\nline */\n// own\nreturn;\n}",
        output: "function work() {\nprepare(); /* multi\nline */\n\n// own\nreturn;\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a multiline guard clause closes its group with a blank line",
        code: "function work() {\nif (\nready === undefined\n) return null;\nconst result = compute();\n}",
        output: "function work() {\nif (\nready === undefined\n) return null;\n\nconst result = compute();\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "CRLF files get CRLF fixes",
        code: "function work() {\r\nconst a = prepare();\r\nreturn a;\r\n}",
        output: "function work() {\r\nconst a = prepare();\r\n\r\nreturn a;\r\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "top-level statements are checked",
        code: 'import x from "x";\nfunction work() {\nreturn x;\n}\nconst y = work();',
        output: 'import x from "x";\n\nfunction work() {\nreturn x;\n}\n\nconst y = work();',
        errors: [
            {
                messageId: "expectedBlankLine"
            },
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "multiple missing blank lines are fixed together",
        code: "function work() {\nif (ready) {\nwork();\n}\nfinish();\nreturn;\n}",
        output: "function work() {\nif (ready) {\nwork();\n}\n\nfinish();\n\nreturn;\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            },
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a multiline statement is separated from a following guard clause",
        code: "const config = buildConfig({\na: 1\n});\nif (!config.valid) return;\n",
        output: "const config = buildConfig({\na: 1\n});\n\nif (!config.valid) return;\n",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "statements inside a static block are checked",
        code: "class Worker {\nstatic {\nconst config = build({\na: 1\n});\nrun(config);\n}\n}",
        output: "class Worker {\nstatic {\nconst config = build({\na: 1\n});\n\nrun(config);\n}\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "statements inside a namespace are checked",
        code: "namespace ns {\nconst config = build({\na: 1\n});\nrun(config);\n}",
        output: "namespace ns {\nconst config = build({\na: 1\n});\n\nrun(config);\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a switch case body requires a blank line before its return",
        code: "switch (value) {\ncase 1:\nwork();\nreturn;\n}",
        output: "switch (value) {\ncase 1:\nwork();\n\nreturn;\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a do-while statement is followed by a blank line",
        code: "function work() {\ndo {\nwork();\n} while (ready);\nreturn;\n}",
        output: "function work() {\ndo {\nwork();\n} while (ready);\n\nreturn;\n}",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a comment after imports stays with the following statement",
        code: 'import value from "a"; // Load value.\n// Use value.\nconst result = value;',
        output: 'import value from "a"; // Load value.\n\n// Use value.\nconst result = value;',
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    {
        name: "a JSDoc comment stays attached to its export",
        code: "const value = 1;\n/** Public API. */\nexport { value };",
        output: "const value = 1;\n\n/** Public API. */\nexport { value };",
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    },
    ...(
        [
            ['import {\na\n} from "a";', "const value = a;"],
            ['import {\na\n} from "a";', "export {\na\n};"],
            ["const config = {\na: 1\n};", 'import {\nb\n} from "b";'],
            ['export {\na\n} from "a";', "const value = 1;"],
            ['export {\na\n} from "a";', 'import {\nb\n} from "b";'],
            ["const config = {\na: 1\n};", "export {\nconfig\n};"],
            ['import value from "a";', "const result = value;"],
            ['import type { Value } from "a";', "const result = 1;"],
            ['import "a";', "const result = 1;"],
            ['import value = require("a");', "const result = value;"],
            ['import value from "a";', "export { value };"],
            ["const value = 1;", "export { value };"],
            ["const value = 1;", 'export { value } from "a";'],
            ["const value = 1;", 'export * from "a";'],
            ["const value = 1;", "export default value;"],
            ["const value = 1;", "export const result = value;"],
            ["const value = 1;", "export function work() {}"],
            ["const value = 1;", "export class Worker {}"],
            ["const value = 1;", "export type Value = number;"],
            ["const value = 1;", "export interface Config {}"],
            ["const value = 1;", "export = value;"],
            ["const value = 1;", "export as namespace Config;"]
        ] as const
    ).map(([previous, next]) => ({
        code: `${previous}\n${next}`,
        output: `${previous}\n\n${next}`,
        errors: [
            {
                messageId: "expectedBlankLine"
            }
        ]
    }))
] as const;

export { invalidCases };
