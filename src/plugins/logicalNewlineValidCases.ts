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
    }
] as const;

export { validCases };
