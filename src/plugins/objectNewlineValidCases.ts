const validCases = [
    {
        name: "empty objects do not require newlines in any context",
        code: "const value = {}; function get() { return {}; } fn({}); new Example({}); const list = [{}];"
    },
    {
        name: "shorthand arguments do not count toward the threshold",
        code: "fn({bodyHast, locale, title, extra});"
    },
    {
        name: "two longhand properties remain below the threshold",
        code: 'fn({bodyHast: "hoge", locale: "ja", title});'
    },
    {
        name: "spreads do not count toward the threshold",
        code: "fn({...options, ...overrides, a: 1, b: 2, title});"
    },
    {
        name: "constructors use the same argument threshold",
        code: "new Example({a: 1, b: 2, title});"
    },
    {
        name: "optional calls use the same argument threshold",
        code: "fn?.({a: 1, b: 2, title});"
    },
    {
        name: "parentheses and TypeScript wrappers preserve argument context",
        code: "fn((({a: 1, b: 2, title} as const) satisfies Options)!); fn(<Options>{a: 1, b: 2});",
        filename: "example.ts"
    },
    {
        name: "method and accessor shorthand are not key-value properties",
        code: "fn({a: 1, b: 2, method() {}, get value() { return 1; }, set value(next) { consume(next); }});"
    },
    {
        name: "TypeScript instantiation wrappers preserve the below-threshold argument exemption",
        code: "fn(({a: 1, b: 2} as Generic)<string>);"
    },
    {
        name: "existing newlines in a below-threshold argument remain untouched",
        code: "fn({\n    bodyHast,\n\n    locale,\n    title\n});"
    },
    {
        name: "existing CRLF newlines remain untouched",
        code: "const value = {\r\n    a: 1,\r\n    b: 2\r\n};"
    },
    {
        name: "indentation is not audited",
        code: "const value = {\na: 1,\n        b: 2\n};"
    },
    {
        name: "three longhand argument properties comply when expanded",
        code: "fn({\na: 1,\nb: 2,\nc: 3\n});"
    },
    {
        name: "expanded definitions and returns comply",
        code: "const value = {\na\n}; function get() { return {\na\n}; } const create = () => ({\na\n});"
    },
    {
        name: "destructuring and type literals are outside the rule",
        code: "const {a, b, c} = value; type Options = {a: number; b: number}; interface Result {a: number}"
    },
    {
        name: "braces in comments and strings are not objects",
        code: 'const text = "{a: 1,b: 2}"; /* {c: 3} */'
    }
] as const;

export { validCases };
