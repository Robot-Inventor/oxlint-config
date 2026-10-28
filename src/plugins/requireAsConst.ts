import type { ESTree, Rule } from "@oxlint/plugins";

/*
 * Require `as const` on object and array literals that initialize `const` variables and are never mutated:
 *
 * - Only `const` declarations with an identifier binding are targeted.
 * - Literals wrapped in parentheses or TypeScript wrappers are treated the same way.
 * - Declarations with type annotations are exempt because `as const` can conflict with the annotated mutable type.
 *
 * Scope analysis has already resolved all references before AST traversal starts,
 * so references made after the declaration are visible when the declarator is visited.
 */

const findLiteralInit = (init: ESTree.Expression): ESTree.Expression => {
    let node = init;

    while (
        node.type === "ParenthesizedExpression" ||
        node.type === "TSSatisfiesExpression" ||
        node.type === "TSNonNullExpression"
    ) {
        node = node.expression;
    }

    return node;
};

/*
 * Resolve the identifier to the outermost node that is still a potential assignment target,
 * so that writes like `hoge.foo.bar = 1` or `({ foo: hoge.baz } = options);` are all detected.
 */
const getTargetRoot = (node: ESTree.Node): ESTree.Node => {
    const { parent } = node;
    if (!parent) return node;

    if (parent.type === "MemberExpression" && parent.object === node) return getTargetRoot(parent);
    if (
        parent.type === "ParenthesizedExpression" ||
        parent.type === "ChainExpression" ||
        parent.type === "TSAsExpression" ||
        parent.type === "TSTypeAssertion" ||
        parent.type === "TSNonNullExpression" ||
        parent.type === "TSSatisfiesExpression"
    ) {
        return getTargetRoot(parent);
    }
    if (parent.type === "ObjectPattern" || parent.type === "ArrayPattern") return getTargetRoot(parent);
    if (parent.type === "Property" && parent.value === node) return getTargetRoot(parent);
    if (parent.type === "AssignmentPattern" && parent.left === node) return getTargetRoot(parent);
    if (parent.type === "RestElement") return getTargetRoot(parent);

    return node;
};

const isWriteTarget = (node: ESTree.Node): boolean => {
    const root = getTargetRoot(node);
    const { parent } = root;
    if (!parent) return false;

    if (parent.type === "AssignmentExpression") return parent.left === root;
    if (parent.type === "ForOfStatement" || parent.type === "ForInStatement") return parent.left === root;
    if (parent.type === "UpdateExpression") return true;
    if (parent.type === "UnaryExpression") return parent.operator === "delete";

    return false;
};

const mutatingArrayMethods = new Set([
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "sort",
    "reverse",
    "fill",
    "copyWithin"
]);

const isArrayMutation = (node: ESTree.Node): boolean => {
    let root = getTargetRoot(node);
    if (root.parent?.type !== "CallExpression" || root.parent.callee !== root) return false;

    while (
        root.type === "ParenthesizedExpression" ||
        root.type === "ChainExpression" ||
        root.type === "TSAsExpression" ||
        root.type === "TSTypeAssertion" ||
        root.type === "TSNonNullExpression" ||
        root.type === "TSSatisfiesExpression"
    ) {
        root = root.expression;
    }
    if (root.type !== "MemberExpression") return false;

    return (
        (root.property.type === "Identifier" && !root.computed && mutatingArrayMethods.has(root.property.name)) ||
        (root.property.type === "Literal" &&
            typeof root.property.value === "string" &&
            mutatingArrayMethods.has(root.property.value))
    );
};

const requireAsConstRule = {
    meta: {
        type: "suggestion",
        fixable: "code",
        schema: [],
        messages: {
            expectedAsConst: "Add `as const` to the literal to make it readonly."
        }
    },
    createOnce(context) {
        return {
            VariableDeclarator(node): void {
                const { parent } = node;
                if (parent.type !== "VariableDeclaration") return;
                if (parent.kind !== "const") return;
                if (node.id.type !== "Identifier" || node.id.typeAnnotation) return;
                if (node.init === null) return;

                const literalInit = findLiteralInit(node.init);
                if (literalInit.type !== "ObjectExpression" && literalInit.type !== "ArrayExpression") return;

                const [variable] = context.sourceCode.getDeclaredVariables(node);
                if (!variable) return;

                // The binding identifier itself is not treated as a write.
                const isMutated = variable.references.some(
                    (reference) =>
                        reference.identifier !== node.id &&
                        (reference.isWrite() ||
                            isWriteTarget(reference.identifier) ||
                            (literalInit.type === "ArrayExpression" && isArrayMutation(reference.identifier)))
                );
                if (isMutated) return;

                context.report({
                    node,
                    messageId: "expectedAsConst",
                    fix: (fixer) => fixer.insertTextAfter(literalInit, " as const")
                });
            }
        };
    }
} as const satisfies Rule;

export { requireAsConstRule };
