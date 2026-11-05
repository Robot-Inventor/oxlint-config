import type { ESTree, Rule } from "@oxlint/plugins";

/*
 * Blank line rules that separate logical groups of statements:
 *
 * - Require a blank line before a plain `return` or `throw` statement, even right after guard clauses.
 * - Guard clauses (`if (...) return/throw/continue/break;`) do not require a blank line before them,
 *   so temporary variables for the condition can sit directly above the first guard clause.
 * - Consecutive guard clauses form a single group, so blank lines between them are optional.
 * - Require a blank line after a guard clause group, before the next non-exit statement.
 * - Require a blank line after any other multiline statement (control-flow blocks, multiline
 *   declarations, long calls, etc.), because a multiline statement is treated as its own group.
 * - Consecutive imports or consecutive exports form a single group, so blank lines are optional.
 * - A comment on its own line belongs to the following statement, so the blank line is required
 *   before the comment.
 * - Fine formatting such as indentation and consecutive blank lines is left to oxfmt.
 */

const requiredLineGap = 2;

const isPlainExit = (statement: ESTree.Statement): boolean =>
    statement.type === "ReturnStatement" || statement.type === "ThrowStatement";

const isGuardClause = (statement: ESTree.Statement): boolean =>
    statement.type === "IfStatement" &&
    statement.alternate === null &&
    (statement.consequent.type === "ReturnStatement" ||
        statement.consequent.type === "ThrowStatement" ||
        statement.consequent.type === "ContinueStatement" ||
        statement.consequent.type === "BreakStatement");

const isExitGroupMember = (statement: ESTree.Statement): boolean => isPlainExit(statement) || isGuardClause(statement);

const isMultiline = (statement: ESTree.Statement): boolean => statement.loc.start.line !== statement.loc.end.line;

const isImport = (statement: ESTree.Statement): boolean =>
    statement.type === "ImportDeclaration" || statement.type === "TSImportEqualsDeclaration";

const isExport = (statement: ESTree.Statement): boolean =>
    statement.type === "ExportNamedDeclaration" ||
    statement.type === "ExportDefaultDeclaration" ||
    statement.type === "ExportAllDeclaration" ||
    statement.type === "TSExportAssignment" ||
    statement.type === "TSNamespaceExportDeclaration";

/*
 * The decision only involves the adjacent pair, so no group analysis is needed:
 * - A plain exit statement always follows a blank line, even right after guard clauses.
 * - Inside an exit group (guard clauses and plain exits in sequence) blank lines are optional.
 * - The end of an exit group and the end of any other multiline statement start a new group.
 */
const requiresBlankLine = (previous: ESTree.Statement, next: ESTree.Statement): boolean => {
    if (isImport(previous) && isImport(next)) return false;
    if (isExport(previous) && isExport(next)) return false;
    if (isPlainExit(next)) return true;
    if (isExitGroupMember(previous)) return !isExitGroupMember(next);

    return isMultiline(previous);
};

const logicalNewlineRule = {
    meta: {
        type: "layout",
        fixable: "whitespace",
        schema: [],
        messages: {
            expectedBlankLine: "Expected a blank line before this statement."
        }
    },
    createOnce(context) {
        const checkStatementPair = (previous: ESTree.Statement, next: ESTree.Statement): void => {
            if (!requiresBlankLine(previous, next)) return;

            const { sourceCode } = context;

            /*
             * The group starts at the next statement or the first comment on its own line.
             * Comments trailing the previous statement on its last line stay in that group, so a
             * multiline trailing comment extends the group's last line.
             */
            let previousGroupEndLine = previous.loc.end.line;
            let groupStartLine = next.loc.start.line;
            let insertionOffset = previous.end;
            for (const comment of sourceCode.getCommentsAfter(previous)) {
                if (comment.loc.start.line <= previousGroupEndLine) {
                    insertionOffset = comment.end;
                    previousGroupEndLine = Math.max(previousGroupEndLine, comment.loc.end.line);
                } else {
                    groupStartLine = Math.min(groupStartLine, comment.loc.start.line);
                }
            }

            if (groupStartLine - previousGroupEndLine >= requiredLineGap) return;

            const lineBreak = sourceCode.getText().startsWith("\r\n", insertionOffset) ? "\r\n" : "\n";
            context.report({
                node: next,
                messageId: "expectedBlankLine",
                fix: (fixer) => fixer.insertTextBeforeRange([insertionOffset, insertionOffset], lineBreak)
            });
        };

        const checkStatementList = (statements: ESTree.Statement[]): void => {
            const [first, ...following] = statements;
            if (!first) return;

            let previous: ESTree.Statement = first;
            for (const statement of following) {
                checkStatementPair(previous, statement);
                previous = statement;
            }
        };

        return {
            Program(node): void {
                checkStatementList(node.body);
            },
            BlockStatement(node): void {
                checkStatementList(node.body);
            },
            SwitchCase(node): void {
                checkStatementList(node.consequent);
            },
            StaticBlock(node): void {
                checkStatementList(node.body);
            },
            TSModuleBlock(node): void {
                checkStatementList(node.body);
            }
        };
    }
} as const satisfies Rule;

export { logicalNewlineRule };
