const invalidCases = [
    {
        name: "three longhand properties reach the argument threshold",
        code: 'fn({bodyHast: "hoge",locale: "ja",title: "foo"});',
        output: 'fn({\nbodyHast: "hoge",\nlocale: "ja",\ntitle: "foo"\n});',
        errors: [
            {
                messageId: "expectedNewlines",
                line: 1,
                column: 3
            }
        ]
    },
    {
        name: "additional shorthand and spreads do not hide three longhand properties",
        code: "fn({a: 1,...options,title,b: 2,c: 3});",
        output: "fn({\na: 1,\n...options,\ntitle,\nb: 2,\nc: 3\n});",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "more than three longhand properties also require newlines",
        code: "fn({a: 1,b: 2,c: 3,d: 4});",
        output: "fn({\na: 1,\nb: 2,\nc: 3,\nd: 4\n});",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "wrapped arguments still expand at the threshold",
        code: "fn((({a: 1,b: 2,c: 3} as const) satisfies Options)!);",
        output: "fn((({\na: 1,\nb: 2,\nc: 3\n} as const) satisfies Options)!);",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "function-valued key-value properties count toward the threshold",
        code: 'fn({onReady: () => {},onEnd: () => {},title: "foo"});',
        output: 'fn({\nonReady: () => {},\nonEnd: () => {},\ntitle: "foo"\n});',
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "TypeScript instantiation wrappers preserve the three-property threshold",
        code: "fn(({a: 1,b: 2,c: 3} as Generic)<string>);",
        output: "fn(({\na: 1,\nb: 2,\nc: 3\n} as Generic)<string>);",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "computed and quoted keys count as longhand properties",
        code: 'fn({[key]: 1,"quoted": 2,c: 3});',
        output: 'fn({\n[key]: 1,\n"quoted": 2,\nc: 3\n});',
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "constructors expand at three longhand properties",
        code: "new Example({a: 1,b: 2,c: 3});",
        output: "new Example({\na: 1,\nb: 2,\nc: 3\n});",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "optional calls expand at three longhand properties",
        code: "fn?.({a: 1,b: 2,c: 3});",
        output: "fn?.({\na: 1,\nb: 2,\nc: 3\n});",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "a one-property definition requires newlines",
        code: "const value = {a};",
        output: "const value = {\na\n};",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "shorthand-only definitions still require newlines",
        code: "const value = {bodyHast,locale,title};",
        output: "const value = {\nbodyHast,\nlocale,\ntitle\n};",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "returns require newlines",
        code: "function get() { return {a}; }",
        output: "function get() { return {\na\n}; }",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "implicit arrow returns require newlines",
        code: "const get = () => ({a});",
        output: "const get = () => ({\na\n});",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "array elements are not arguments",
        code: "fn([{a: 1},{b: 2}]);",
        output: "fn([{\na: 1\n},{\nb: 2\n}]);",
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
        name: "a nested property value is not a direct argument",
        code: "fn({request: {headers}});",
        output: "fn({request: {\nheaders\n}});",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "nested definitions are fixed over successive passes",
        code: "const value = {nested: {a}};",
        output: "const value = {\nnested: {\na\n}\n};",
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
        name: "a conditional value inside an argument is not a direct argument",
        code: "fn(condition ? {a: 1} : {});",
        output: "fn(condition ? {\na: 1\n} : {});",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "an object used as the callee is not an argument",
        code: "({a})();",
        output: "({\na\n})();",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "TypeScript wrappers do not exempt definitions",
        code: "const value = ({a} as const) satisfies Options;",
        output: "const value = ({\na\n} as const) satisfies Options;",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "existing newlines are preserved while missing property separators are added",
        code: "const value = {\n  a: 1,b: 2,\n\n  c: 3\n};",
        output: "const value = {\n  a: 1,\nb: 2,\n\n  c: 3\n};",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "a multiline property does not exempt inline object boundaries",
        code: "const value = {method() {\nreturn 1;\n}};",
        output: "const value = {\nmethod() {\nreturn 1;\n}\n};",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "a missing opening newline is added without changing indentation",
        code: "const value = {a: 1,\n    b: 2\n};",
        output: "const value = {\na: 1,\n    b: 2\n};",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "a missing closing newline is added after a trailing comma",
        code: "const value = {\na: 1,};",
        output: "const value = {\na: 1,\n};",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "comments, strings, and regular expressions are preserved",
        code: 'const value = {/* first */a: "😀,{}",/* next */b: /[,}]/,/* last */};',
        output: 'const value = {/* first */\na: "😀,{}",/* next */\nb: /[,}]/,/* last */\n};',
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "trailing line comments are not moved or removed",
        code: "const value = {a: 1, // keep this comment\n    b: 2};",
        output: "const value = {\na: 1, // keep this comment\n    b: 2\n};",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "test filenames do not exempt violations",
        filename: "example.test.ts",
        code: "const value = {a};",
        output: "const value = {\na\n};",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    },
    {
        name: "in-source test blocks do not exempt violations",
        // マーカー文字列をそのまま書くとテストランナーがこのファイルをインソーステストと誤検出するため、一部をエスケープしている
        code: "if (import.m\u0065ta.vitest) { const value = {a}; }",
        output: "if (import.m\u0065ta.vitest) { const value = {\na\n}; }",
        errors: [
            {
                messageId: "expectedNewlines"
            }
        ]
    }
];

export { invalidCases };
