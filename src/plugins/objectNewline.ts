import type { ESTree, Rule } from "@oxlint/plugins";

/*
 * Line break rules for object literals:
 *
 * - Preserve existing line breaks.
 * - Empty objects and objects containing only spreads do not force line breaks.
 * - Objects used as method-call receivers or implicitly returned by direct callback arguments do not force line breaks.
 * - For direct arguments of functions and constructors, values passed directly to JSX props, and return values of early returns using if,
 *   break lines if there are 3 or more properties in `key: value` format.
 *   Shorthands, spreads, methods, and getters/setters are not counted.
 *   Wrapping in parentheses or TypeScript type-related wrappers is treated the same way.
 *   Early returns only target `if (...) return {...}` with omitted blocks, and do not include `if (...) { return {...} }`.
 * - Except for the above, break lines for everything including variable initial values, return values, array elements, nested values, and JSX child elements.
 * - For items subject to line breaks, require a line break after the opening brace, between properties, and before the closing brace.
 * - Do not audit or fix fine formatting such as indentation, whitespace, or line width, leaving it to Prettier.
 */

const minimumLonghandProperties = 3;
const closingBraceLength = 1;

const getOuterExpression = (node: ESTree.Expression): ESTree.Expression => {
    let expression = node;
    while (
        expression.parent.type === "ParenthesizedExpression" ||
        expression.parent.type === "ChainExpression" ||
        expression.parent.type === "TSAsExpression" ||
        expression.parent.type === "TSSatisfiesExpression" ||
        expression.parent.type === "TSTypeAssertion" ||
        expression.parent.type === "TSNonNullExpression" ||
        expression.parent.type === "TSInstantiationExpression"
    ) {
        expression = expression.parent;
    }

    return expression;
};

const getNewlinePolicy = (node: ESTree.ObjectExpression): "preserve" | "threshold" | "multiline" => {
    if (node.properties.every((property) => property.type === "SpreadElement")) return "preserve";

    const expression = getOuterExpression(node);
    const { parent } = expression;

    if (parent.type === "MemberExpression" && parent.object === expression) {
        const member = getOuterExpression(parent);
        const call = member.parent;
        if (call.type === "CallExpression" && call.callee === member) return "preserve";
    }

    if (parent.type === "ArrowFunctionExpression") {
        const callback = getOuterExpression(parent);
        const call = callback.parent;
        if ((call.type === "CallExpression" || call.type === "NewExpression") && call.callee !== callback) {
            return "preserve";
        }
    }

    if (parent.type === "ReturnStatement") {
        return parent.parent.type === "IfStatement" && parent.parent.consequent === parent ? "threshold" : "multiline";
    }

    return ((parent.type === "CallExpression" || parent.type === "NewExpression") && parent.callee !== expression) ||
        (parent.type === "JSXExpressionContainer" && parent.parent.type === "JSXAttribute")
        ? "threshold"
        : "multiline";
};

const objectNewlineRule = {
    meta: {
        type: "layout",
        fixable: "whitespace",
        schema: [],
        messages: {
            expectedNewlines: "Place object properties and the closing brace on separate lines."
        }
    },
    createOnce(context) {
        return {
            ObjectExpression(node): void {
                const policy = getNewlinePolicy(node);
                if (policy === "preserve") return;

                if (policy === "threshold") {
                    let longhandProperties = 0;
                    for (const property of node.properties) {
                        if (
                            property.type === "Property" &&
                            !property.shorthand &&
                            !property.method &&
                            property.kind === "init"
                        ) {
                            longhandProperties++;
                            if (longhandProperties === minimumLonghandProperties) {
                                break;
                            }
                        }
                    }

                    if (longhandProperties < minimumLonghandProperties) return;
                }

                const insertionOffsets: number[] = [];
                let previousLine = node.loc.start.line;
                for (const property of node.properties) {
                    if (previousLine === property.loc.start.line) {
                        insertionOffsets.push(property.start);
                    }
                    previousLine = property.loc.end.line;
                }

                if (previousLine === node.loc.end.line) {
                    insertionOffsets.push(node.end - closingBraceLength);
                }
                if (insertionOffsets.length) {
                    context.report({
                        node,
                        messageId: "expectedNewlines",
                        fix: (fixer) =>
                            insertionOffsets.map((offset) => fixer.insertTextBeforeRange([offset, offset], "\n"))
                    });
                }
            }
        };
    }
} as const satisfies Rule;

export { objectNewlineRule };
