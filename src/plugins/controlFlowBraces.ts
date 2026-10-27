import type { ESTree, Rule } from "@oxlint/plugins";

const braceLength = 1;

const isExit = (body: ESTree.Statement): boolean => {
    let statement = body;
    if (body.type === "BlockStatement") {
        const [first, second] = body.body;
        if (!first || second) return false;

        statement = first;
    }

    return (
        statement.type === "ReturnStatement" ||
        statement.type === "ThrowStatement" ||
        statement.type === "ContinueStatement" ||
        statement.type === "BreakStatement"
    );
};

const controlFlowBracesRule = {
    meta: {
        type: "layout",
        fixable: "code",
        schema: [],
        messages: {
            expectedBlock: "Wrap this control-flow body in a block with line breaks.",
            expectedNewlines: "Add line breaks after the opening brace and before the closing brace."
        }
    },
    createOnce(context) {
        const checkBody = (body: ESTree.Statement): void => {
            const { sourceCode } = context;

            if (body.type !== "BlockStatement") {
                // Multiline unbraced statements are already handled by curly: ["error", "multi-line"].
                const previous = sourceCode.getTokenBefore(body, { includeComments: true });
                if (previous && previous.loc.end.line !== body.loc.start.line) return;
                const statementText = sourceCode.getText(body).replace(/[\s;]+$/u, "");
                if (statementText.includes("\n")) return;

                context.report({
                    node: body,
                    messageId: "expectedBlock",
                    fix: (fixer) => [fixer.insertTextBefore(body, "{\n"), fixer.insertTextAfter(body, "\n}")]
                });
                return;
            }

            const first = sourceCode.getFirstToken(body, { skip: 1, includeComments: true });
            const last = sourceCode.getLastToken(body, { skip: 1, includeComments: true });
            if (!first || !last) return;

            const insertionOffsets = new Set<number>();
            if (first.loc.start.line === body.loc.start.line) {
                insertionOffsets.add(body.start + braceLength);
            }
            if (last.loc.end.line === body.loc.end.line) {
                insertionOffsets.add(body.end - braceLength);
            }
            if (!insertionOffsets.size) return;

            context.report({
                node: body,
                messageId: "expectedNewlines",
                fix: (fixer) =>
                    Array.from(insertionOffsets, (offset) => fixer.insertTextBeforeRange([offset, offset], "\n"))
            });
        };

        return {
            IfStatement(node): void {
                const isElseIf = node.parent.type === "IfStatement" && node.parent.alternate === node;
                if (node.alternate || isElseIf || !isExit(node.consequent)) {
                    checkBody(node.consequent);
                }
                if (node.alternate && node.alternate.type !== "IfStatement") {
                    checkBody(node.alternate);
                }
            },
            ForStatement(node): void {
                checkBody(node.body);
            },
            ForInStatement(node): void {
                checkBody(node.body);
            },
            ForOfStatement(node): void {
                checkBody(node.body);
            },
            WhileStatement(node): void {
                checkBody(node.body);
            },
            DoWhileStatement(node): void {
                checkBody(node.body);
            }
        };
    }
} as const satisfies Rule;

export { controlFlowBracesRule };
