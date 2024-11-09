import * as vscode from "vscode";

export function activateTestDecorations(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "artisanTest.runTestMethod",
      (uri: vscode.Uri, methodName: string) => {
        runTestMethod(uri, methodName);
      }
    )
  );

  vscode.languages.registerCodeActionsProvider("php", {
    provideCodeActions(document, range, context, token) {
      const line = document.lineAt(range.start.line);
      const regexSingle = /\b(it|test)\s*\(\s*['"`](.*?)['"`]/;
      const match = regexSingle.exec(line.text);
      if (match) {
        const methodName = match[2];
        const action = new vscode.CodeAction(
          "Run This Test",
          vscode.CodeActionKind.Empty
        );
        action.command = {
          command: "artisanTest.runTestMethod",
          title: "Run This Test",
          arguments: [document.uri, methodName],
        };
        return [action];
      }
      return [];
    },
  });

  vscode.languages.registerCodeLensProvider("php", {
    provideCodeLenses(document, token) {
      const text = document.getText();
      const regexGlobal = /\b(it|test)\s*\(\s*['"`](.*?)['"`]/g;
      const lenses: vscode.CodeLens[] = [];
      let match;
      while ((match = regexGlobal.exec(text))) {
        const startPos = document.positionAt(match.index);
        const range = new vscode.Range(startPos, startPos);
        const methodName = match[2];
        const lens = new vscode.CodeLens(range, {
          title: "Run This Test",
          command: "artisanTest.runTestMethod",
          arguments: [document.uri, methodName],
        });
        lenses.push(lens);
      }
      return lenses;
    },
  });

  vscode.languages.registerHoverProvider("php", {
    provideHover(document, position, token) {
      const line = document.lineAt(position.line);
      const regexSingle = /\b(it|test)\s*\(\s*['"`](.*?)['"`]/;
      const match = regexSingle.exec(line.text);
      if (match) {
        const methodName = match[2];
        const markdownString = new vscode.MarkdownString(
          `[Run This Test](command:artisanTest.runTestMethod?${encodeURIComponent(
            JSON.stringify([document.uri, methodName])
          )})`
        );
        markdownString.isTrusted = true;
        return new vscode.Hover(markdownString);
      }
      return undefined;
    },
  });
}

function runTestMethod(uri: vscode.Uri, methodName: string) {
  const args = ["artisan", "test", uri.fsPath, "--filter", methodName];
  const vscodeTask = new vscode.Task(
    { type: "shell", task: "Run Test Method" },
    vscode.TaskScope.Workspace,
    "Run Test Method",
    "shell",
    new vscode.ShellExecution("php", args),
    []
  );
  vscode.tasks.executeTask(vscodeTask);
}
