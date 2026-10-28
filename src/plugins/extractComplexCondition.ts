import type { ESTree, Rule } from "@oxlint/plugins";

const singleCondition = 1;
const minimumConditions = 3;

const countConditions = (node: ESTree.Node): number => {
    if (node.type === "ParenthesizedExpression") return countConditions(node.expression);
    if (node.type === "UnaryExpression" && node.operator === "!") return countConditions(node.argument);
    if (node.type === "LogicalExpression" && node.operator !== "??") {
        return countConditions(node.left) + countConditions(node.right);
    }
    return singleCondition;
};

const extractComplexConditionRule = {
    meta: {
        type: "suggestion",
        schema: [],
        messages: {
            extract: "Extract this complex condition into a named variable."
        }
    },
    createOnce(context) {
        return {
            LogicalExpression(node): void {
                if (node.operator === "??") return;

                let current: ESTree.Node = node;
                let parent: ESTree.Node | null = current.parent;
                while (
                    parent.type === "ParenthesizedExpression" ||
                    (parent.type === "UnaryExpression" && parent.operator === "!")
                ) {
                    current = parent;
                    ({ parent } = current);
                }
                if (parent.type === "LogicalExpression" && parent.operator !== "??") return;
                if (countConditions(current) < minimumConditions) return;

                while (parent) {
                    const isFunction =
                        parent.type === "FunctionDeclaration" ||
                        parent.type === "FunctionExpression" ||
                        parent.type === "ArrowFunctionExpression";
                    if (isFunction) return;

                    const isCondition =
                        (parent.type === "IfStatement" || parent.type === "ConditionalExpression") &&
                        parent.test === current;
                    if (isCondition) {
                        context.report({ node: current, messageId: "extract" });
                        return;
                    }
                    current = parent;
                    ({ parent } = current);
                }
            }
        };
    }
} as const satisfies Rule;

export { extractComplexConditionRule };
