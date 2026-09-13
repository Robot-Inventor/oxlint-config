import { type ExternalPluginEntry, type OxlintConfig, defineConfig } from "oxlint";
import { NEXTJS_RULES, RECOMMENDED_RULES } from "oxlint-plugin-react-doctor";
import { baseRules, typescriptOverrides } from "./base-rules.ts";

const corePluginSpecifier = new URL(
    import.meta.url.endsWith(".ts") ? "./eslint-core-plugin.ts" : "./eslint-core-plugin.js",
    import.meta.url
).href;

const baseJsPlugins = [
    {
        name: "eslint-core-js",
        specifier: corePluginSpecifier
    },
    {
        name: "import-js",
        specifier: import.meta.resolve("eslint-plugin-import-x")
    },
    {
        name: "jsdoc-js",
        specifier: import.meta.resolve("eslint-plugin-jsdoc")
    }
] as const satisfies ExternalPluginEntry[];

const reactJsPlugins = [
    ...baseJsPlugins,
    {
        name: "react-doctor",
        specifier: import.meta.resolve("oxlint-plugin-react-doctor")
    }
] as const satisfies ExternalPluginEntry[];

const nextJsPlugins = [
    ...reactJsPlugins,
    {
        name: "nextjs-js",
        specifier: import.meta.resolve("@next/eslint-plugin-next")
    }
] as const satisfies ExternalPluginEntry[];

const commonSettings = {
    "import-x/extensions": [".ts", ".tsx", ".cts", ".mts", ".js", ".jsx", ".cjs", ".mjs"],
    "import-x/external-module-folders": ["node_modules", "node_modules/@types"],
    "import-x/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx", ".cts", ".mts"]
    },
    "import-x/resolver": {
        node: true,
        typescript: true
    }
} as const satisfies NonNullable<OxlintConfig["settings"]>;

const reactSettings = {
    ...commonSettings,
    "react-doctor": {
        capabilities: ["react-compiler"],
        jsxMaxDepth: {
            max: 4
        }
    }
} as const satisfies NonNullable<OxlintConfig["settings"]>;

const commonRoot = {
    categories: {
        correctness: "off"
    },
    env: {
        builtin: true
    },
    options: {
        reportUnusedDisableDirectives: "error",
        typeAware: true
    }
} as const satisfies OxlintConfig;

const baseConfig = defineConfig({
    plugins: ["typescript", "jsdoc", "unicorn", "import"],
    rules: {
        ...baseRules,
        "eslint-core-js/camelcase": "error",
        "eslint-core-js/require-atomic-updates": "error",
        "import-js/no-extraneous-dependencies": "error",
        "import-js/no-unresolved": "error",
        "import-js/no-useless-path-segments": "error",
        "jsdoc-js/check-alignment": "error",
        "jsdoc-js/check-param-names": "error",
        "jsdoc-js/check-types": "error",
        "jsdoc-js/check-values": "error",
        "jsdoc-js/escape-inline-tags": "error",
        "jsdoc-js/multiline-blocks": "error",
        "jsdoc-js/no-multi-asterisks": "error",
        "jsdoc-js/no-types": "error",
        "jsdoc-js/reject-any-type": "error",
        "jsdoc-js/reject-function-type": "error",
        "jsdoc-js/require-next-type": "error",
        "jsdoc-js/require-returns-check": "error",
        "jsdoc-js/require-yields-check": "error",
        "jsdoc-js/tag-lines": "error",
        "jsdoc-js/ts-no-empty-object-type": "error",
        "jsdoc-js/valid-types": "error"
    },
    overrides: [
        {
            files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
            rules: typescriptOverrides
        }
    ]
});

const noJSDocRequirement = defineConfig({
    rules: {
        "jsdoc-js/require-jsdoc": "off"
    }
});

const JSDocRequirement = defineConfig({
    rules: {
        "jsdoc-js/require-jsdoc": [
            "error",
            {
                checkAllFunctionExpressions: false,
                checkConstructors: true,
                checkGetters: true,
                checkSetters: true,
                enableFixer: true,
                exemptEmptyConstructors: false,
                exemptEmptyFunctions: false,
                exemptOverloadedImplementations: false,
                fixerMessage: "",
                require: {
                    ArrowFunctionExpression: true,
                    ClassDeclaration: true,
                    ClassExpression: true,
                    FunctionDeclaration: true,
                    FunctionExpression: true,
                    MethodDefinition: true
                },
                skipInterveningOverloadedDeclarations: true
            }
        ]
    }
});

const reactConfig = defineConfig({
    plugins: ["react"],
    rules: {
        ...RECOMMENDED_RULES,
        "react/exhaustive-deps": "warn",
        "react/rules-of-hooks": "error"
    },
    overrides: [
        {
            files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
            rules: {
                "jsdoc/check-tag-names": [
                    "error",
                    {
                        definedTags: ["jsxImportSource"]
                    }
                ],
                "react/capitalized-calls": "error",
                "react/error-boundaries": "error",
                "react/exhaustive-effect-dependencies": "off",
                "react/globals": "error",
                "react/hooks": "off",
                "react/immutability": "error",
                "react/incompatible-library": "error",
                "react/invariant": "warn",
                "react/hook-use-state": "warn",
                "react/iframe-missing-sandbox": "warn",
                "react/jsx-boolean-value": ["error", "never"],
                "react/jsx-curly-brace-presence": ["error", "never"],
                "react/jsx-key": "error",
                "react/jsx-no-comment-textnodes": "warn",
                "react/jsx-no-script-url": "warn",
                "react/memo-dependencies": "off",
                "react/no-array-index-key": "warn",
                "react/no-children-prop": "warn",
                "react/no-clone-element": "warn",
                "react/no-danger": "warn",
                "react/no-danger-with-children": "error",
                "react/no-deriving-state-in-effects": "error",
                "react/no-did-mount-set-state": "warn",
                "react/no-did-update-set-state": "warn",
                "react/no-direct-mutation-state": "error",
                "react/no-find-dom-node": "error",
                "react/no-namespace": "error",
                "react/no-react-children": "warn",
                "react/no-render-return-value": "error",
                "react/no-unsafe": ["error", { checkAliases: true }],
                "react/no-unstable-nested-components": "error",
                "react/no-will-update-set-state": "warn",
                "react/preserve-manual-memoization": "error",
                "react/purity": "error",
                "react/refs": "error",
                "react/rule-suppression": "error",
                "react/self-closing-comp": [
                    "error",
                    {
                        component: true,
                        html: true
                    }
                ],
                "react/set-state-in-effect": "error",
                "react/set-state-in-render": "error",
                "react/static-components": "error",
                "react/syntax": "error",
                "react/todo": "warn",
                "react/unsupported-syntax": "error",
                "react/use-memo": "error",
                "react/void-dom-elements-no-children": "error",
                "react/void-use-memo": "error"
            }
        }
    ]
});

const nextConfig = defineConfig({
    plugins: ["nextjs"],
    rules: {
        ...NEXTJS_RULES,
        "nextjs-js/no-location-assign-relative-destination": "warn",
        "nextjs/google-font-display": "warn",
        "nextjs/google-font-preconnect": "warn",
        "nextjs/inline-script-id": "error",
        "nextjs/next-script-for-ga": "warn",
        "nextjs/no-assign-module-variable": "error",
        "nextjs/no-async-client-component": "warn",
        "nextjs/no-before-interactive-script-outside-document": "warn",
        "nextjs/no-css-tags": "warn",
        "nextjs/no-document-import-in-page": "error",
        "nextjs/no-duplicate-head": "error",
        "nextjs/no-head-element": "warn",
        "nextjs/no-head-import-in-document": "error",
        "nextjs/no-html-link-for-pages": "error",
        "nextjs/no-img-element": "warn",
        "nextjs/no-page-custom-font": "warn",
        "nextjs/no-script-component-in-head": "error",
        "nextjs/no-styled-jsx-in-document": "warn",
        "nextjs/no-sync-scripts": "error",
        "nextjs/no-title-in-document-head": "warn",
        "nextjs/no-typos": "warn",
        "nextjs/no-unwanted-polyfillio": "warn"
    }
});

const oxlintConfigNoJSDoc = defineConfig({
    ...commonRoot,
    extends: [baseConfig, noJSDocRequirement],
    jsPlugins: baseJsPlugins,
    settings: commonSettings
});

const oxlintConfig = defineConfig({
    ...commonRoot,
    extends: [baseConfig, JSDocRequirement],
    jsPlugins: baseJsPlugins,
    settings: commonSettings
});

const oxlintReactConfigNoJSDoc = defineConfig({
    ...commonRoot,
    extends: [baseConfig, noJSDocRequirement, reactConfig],
    jsPlugins: reactJsPlugins,
    settings: reactSettings
});

const oxlintReactConfig = defineConfig({
    ...commonRoot,
    extends: [baseConfig, JSDocRequirement, reactConfig],
    jsPlugins: reactJsPlugins,
    settings: reactSettings
});

const oxlintNextConfigNoJSDoc = defineConfig({
    ...commonRoot,
    extends: [baseConfig, noJSDocRequirement, reactConfig, nextConfig],
    jsPlugins: nextJsPlugins,
    settings: reactSettings
});

const oxlintNextConfig = defineConfig({
    ...commonRoot,
    extends: [baseConfig, JSDocRequirement, reactConfig, nextConfig],
    jsPlugins: nextJsPlugins,
    settings: reactSettings
});

export {
    oxlintConfig,
    oxlintConfigNoJSDoc,
    oxlintNextConfig,
    oxlintNextConfigNoJSDoc,
    oxlintReactConfig,
    oxlintReactConfigNoJSDoc
};
