import type { ESTree, Rule, SourceCode } from "@oxlint/plugins";

const getExportSpecifiers = (node: ESTree.ExportNamedDeclaration, sourceCode: SourceCode): string[] | null => {
    const { declaration } = node;
    if (!declaration) {
        return node.specifiers.map((specifier) => {
            const text = sourceCode.getText(specifier);

            return node.exportKind === "type" ? `type ${text}` : text;
        });
    }

    if (declaration.type === "VariableDeclaration") {
        return sourceCode.getDeclaredVariables(declaration).map((variable) => variable.name);
    }

    if (!("id" in declaration) || !declaration.id) return null;

    let identifier: ESTree.Node = declaration.id;
    while (identifier.type === "TSQualifiedName") {
        identifier = identifier.left;
    }

    return identifier.type === "Identifier" ? [identifier.name] : null;
};

const getExportKeywordRange = (
    node: ESTree.ExportNamedDeclaration,
    sourceCode: SourceCode
): [number, number] | null => {
    const exportToken = sourceCode.getFirstToken(node, (token) => token.value === "export");
    if (!exportToken) return null;

    const nextToken = sourceCode.getTokenAfter(exportToken);
    if (!nextToken || sourceCode.commentsExistBetween(exportToken, nextToken)) return null;

    return [exportToken.start, nextToken.start];
};

const groupExportsRule = {
    meta: {
        type: "suggestion",
        fixable: "code",
        schema: [],
        messages: {
            groupExports:
                "Separate declarations from exports and combine local named exports into a single export list."
        }
    },
    createOnce(context) {
        return {
            Program(program): void {
                if (/\.d\.[cm]?ts$/u.test(context.filename)) return;

                const exports = program.body.filter(
                    (statement): statement is ESTree.ExportNamedDeclaration =>
                        statement.type === "ExportNamedDeclaration" && statement.source === null
                );

                const [first, ...remaining] = exports;

                if (!first) return;
                if (!remaining.length && first.declaration === null) return;

                context.report({
                    node: first,
                    messageId: "groupExports",
                    fix(fixer) {
                        const { sourceCode } = context;
                        const specifiers = new Set<string>();
                        const fixes = [];

                        for (const node of exports) {
                            const names = getExportSpecifiers(node, sourceCode);
                            if (!names) return null;

                            for (const name of names) {
                                specifiers.add(name);
                            }

                            if (node.declaration) {
                                const range = getExportKeywordRange(node, sourceCode);
                                if (!range) return null;

                                fixes.push(fixer.removeRange(range));
                            } else {
                                // Moving lists with attached comments could change their meaning or lint directives.
                                const hasComments =
                                    sourceCode.getCommentsInside(node).length ||
                                    sourceCode.getCommentsBefore(node).length ||
                                    sourceCode.getCommentsAfter(node).length;

                                if (hasComments) return null;

                                // Keep an ASI boundary when removing an export after an unterminated statement.
                                const previousToken = sourceCode.getTokenBefore(node);
                                const separator = previousToken && previousToken.value !== ";" ? ";" : "";
                                fixes.push(fixer.replaceText(node, separator));
                            }
                        }

                        const lineBreak = sourceCode.text.includes("\r\n") ? "\r\n" : "\n";
                        fixes.push(
                            fixer.insertTextAfterRange(
                                [sourceCode.text.length, sourceCode.text.length],
                                `${lineBreak}export { ${[...specifiers].join(", ")} };`
                            )
                        );

                        return fixes;
                    }
                });
            }
        };
    }
} as const satisfies Rule;

export { groupExportsRule };
