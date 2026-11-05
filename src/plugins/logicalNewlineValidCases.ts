const validCases = [
    {
        name: "temporary variables sit directly above their guard clause",
        code: "function work() {\nconst hasItems = items.length > 0;\nif (!hasItems) return;\n}"
    },
    {
        name: "consecutive guard clauses do not require a blank line",
        code: "function work() {\nif (!ready) return null;\nif (!items.length) return 0;\n}"
    },
    {
        name: "a throw guard clause keeps the guard run intact",
        code: 'function work() {\nif (!ready) return null;\nif (!data) throw new Error("empty");\n}'
    },
    {
        name: "a break guard clause behaves like a return guard clause",
        code: "while (ready) {\nconst done = step();\nif (done) break;\n}"
    },
    {
        name: "a continue guard clause behaves like a return guard clause",
        code: "for (const item of items) {\nconst isEmpty = item.length === 0;\nif (isEmpty) continue;\n}"
    },
    {
        name: "a bare break does not require a blank line before it",
        code: "while (ready) {\nwork();\nbreak;\n}"
    },
    {
        name: "blank lines between consecutive guard clauses are allowed",
        code: "function work() {\nif (!ready) return null;\n\nif (!items.length) return 0;\n}"
    },
    {
        name: "a guard clause group is closed by a blank line",
        code: "function work() {\nif (!ready) return null;\n\nconst result = compute();\n}"
    },
    {
        name: "a plain return after a guard clause has a blank line",
        code: "function work() {\nif (!ready) return null;\n\nreturn fallback;\n}"
    },
    {
        name: "multiline statements are separated from the following statement",
        code: "function work() {\nconst total = items.reduce(\n(sum, item) => sum + item,\n0\n);\n\nreturn total;\n}"
    },
    {
        name: "blocks are separated from the following statement",
        code: "function work() {\nif (total < 0) {\ntotal = 0;\n}\n\nreturn total;\n}"
    },
    {
        name: "a sole statement needs no surrounding blank lines",
        code: "function work() {\nconst a = 1;\n}"
    },
    {
        name: "a final block statement needs no following blank line",
        code: "function work() {\nif (ready) {\nwork();\n}\n}"
    },
    {
        name: "an else-if chain is a single multiline statement",
        code: "function work() {\nif (a) {\ndoA();\n} else if (b) {\ndoB();\n} else {\ndoC();\n}\n\nnext();\n}"
    },
    {
        name: "a multiline guard clause keeps the guard run intact",
        code: "function work() {\nif (\nready === undefined ||\nitems === null\n) return null;\nif (!items.length) return 0;\n}"
    },
    {
        name: "a comment attached to the next statement follows the blank line",
        code: "function work() {\nconst a = prepare();\n\n// Use the prepared value.\nreturn a;\n}"
    },
    {
        name: "a closing lint directive can precede the blank line before exports",
        code: "const hoge = {\na: 1\n};\n/* oxlint-enable sort-keys */\n\nexport { hoge };"
    },
    {
        name: "an own-line comment can end the previous statement's group",
        code: "function work() {\nconst a = prepare();\n// Preparation complete.\n\nreturn a;\n}"
    },
    {
        name: "a blank line between comments separates imports from the next statement",
        code: 'import value from "a";\n// Loading complete.\n\n// Use value.\nconst result = value;'
    },
    {
        name: "a multiline own-line comment can precede a blank line",
        code: "if (ready) return;\n/* Work is\nready. */\n\nrun();"
    },
    {
        name: "a blank line after trailing and own-line comments separates statements",
        code: "function work() {\nprepare(); /* multi\nline */\n// Preparation complete.\n\nreturn;\n}"
    },
    {
        name: "CRLF blank lines after comments are preserved",
        code: "const value = 1;\r\n// Value ready.\r\n\r\nexport { value };"
    },
    {
        name: "a whitespace-only blank line after a comment separates statements",
        code: "const value = 1;\n// Value ready.\n    \nexport { value };"
    },
    {
        name: "a comment inside a guard run does not require a blank line",
        code: "function work() {\nif (!ready) return null;\n// items may be null.\nif (!items) return 0;\n}"
    },
    {
        name: "a trailing comment stays on the previous statement's line",
        code: "function work() {\nprepare(); // Get ready.\n\nreturn;\n}"
    },
    {
        name: "CRLF blank lines are preserved",
        code: "function work() {\r\nconst a = prepare();\r\n\r\nreturn a;\r\n}"
    },
    {
        name: "switch case bodies are checked within each case",
        code: "switch (value) {\ncase 1: {\nwork();\n}\n\ncase 2:\nrun();\n\nreturn;\n}"
    },
    {
        name: "single-line statements may sit next to each other",
        code: "const a = 1;\nconst b = 2;"
    },
    {
        name: "an if-else with an alternate is not a guard clause",
        code: "function work() {\nconst a = 1;\nif (a) return 1; else return 2;\n}"
    },
    {
        name: "statements inside a static block are separated",
        code: "class Worker {\nstatic {\ndoA();\n\nif (flag) {\ndoB();\n}\n}\n}"
    },
    {
        name: "statements inside a namespace are separated",
        code: "namespace ns {\nconst a = 1;\n\nif (a) {\nwork();\n}\n}"
    },
    {
        name: "a multiline statement is separated from a following guard clause",
        code: "const config = buildConfig({\na: 1\n});\n\nif (!config.valid) return;"
    },
    {
        name: "a multiline import may be followed directly by a single-line import",
        code: 'import {\na\n} from "a";\nimport b from "b";'
    },
    {
        name: "a multiline import may be followed directly by another multiline import",
        code: 'import {\na\n} from "a";\nimport {\nb\n} from "b";'
    },
    {
        name: "a multiline import may be followed directly by a side-effect import",
        code: 'import {\na\n} from "a";\nimport "b";'
    },
    {
        name: "comments between consecutive imports do not require a blank line",
        code: 'import {\na\n} from "a";\n// Load b.\nimport b from "b";'
    },
    {
        name: "blank lines between consecutive imports are allowed",
        code: 'import {\na\n} from "a";\n\nimport b from "b";'
    },
    {
        name: "a multiline import may be followed directly by a TypeScript import-equals",
        code: 'import {\na\n} from "a";\nimport b = require("b");'
    },
    {
        name: "a multiline TypeScript import-equals may be followed directly by an import",
        code: 'import a = require(\n"a"\n);\nimport b from "b";'
    },
    {
        name: "consecutive multiline TypeScript import-equals need no blank line",
        code: 'import a = require(\n"a"\n);\nimport b = require(\n"b"\n);'
    },
    {
        name: "single-line imports and exports are separated at group boundaries",
        code: 'import a from "a";\nimport type { B } from "b";\nimport "c";\n\nconst value = a;\n\nexport { value };\nexport type { B };'
    },
    {
        name: "single-line exports do not require a following blank line",
        code: 'export const value = 1;\nconst other = 2;\nimport "a";'
    },
    {
        name: "dynamic imports do not require a following blank line",
        code: 'const module = import("a");\nconst value = module;'
    },
    {
        name: "consecutive exported declarations allow blank lines but do not require them",
        code: "export function work() {\nrun();\n}\nexport class Worker {\n}\n\nexport const value = 1;\nexport type Value = number;\nexport interface Config {\nvalue: Value;\n}"
    },
    {
        name: "a multiline export may be followed directly by a single-line export",
        code: 'export {\na\n} from "a";\nexport { b } from "b";'
    },
    {
        name: "consecutive multiline exports do not require a blank line",
        code: 'export {\na\n} from "a";\nexport {\nb\n} from "b";'
    },
    {
        name: "a multiline export may be followed directly by an export-all",
        code: 'export {\na\n} from "a";\nexport * from "b";'
    },
    {
        name: "a multiline export-all may be followed directly by an export",
        code: 'export *\nfrom "a";\nexport { b } from "b";'
    },
    {
        name: "a multiline export may be followed directly by a default export",
        code: 'export {\na\n} from "a";\nexport default 1;'
    },
    {
        name: "a multiline default export may be followed directly by an export",
        code: 'export default {\na: 1\n};\nexport { b } from "b";'
    },
    {
        name: "comments between consecutive exports do not require a blank line",
        code: 'export {\na\n} from "a";\n// Expose b.\nexport { b } from "b";'
    },
    {
        name: "blank lines between consecutive exports are allowed",
        code: 'export {\na\n} from "a";\n\nexport { b } from "b";'
    },
    {
        name: "a multiline TypeScript namespace export may directly precede an export assignment",
        code: "export as namespace\nConfig;\nexport = {};"
    },
    {
        name: "a multiline TypeScript export assignment may directly precede a namespace export",
        code: "export = {\na: 1\n};\nexport as namespace Config;"
    },
    {
        name: "a multiline export may be followed directly by a TypeScript namespace export",
        code: 'export {\na\n} from "a";\nexport as namespace Config;'
    },
    {
        name: "a multiline TypeScript namespace export may be followed directly by an export",
        code: 'export as namespace\nConfig;\nexport { b } from "b";'
    }
] as const;

export { validCases };
