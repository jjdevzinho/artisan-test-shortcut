import * as vscode from "vscode";

export function activateTestDecorations(context: vscode.ExtensionContext) {
  const codeLensProvider = vscode.languages.registerCodeLensProvider("php", {
    provideCodeLenses(document, token) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return [];
      }

      const fileName = document.fileName;

      // Check if the file is in the tests directory and ends with Test.php
      if (!fileName.endsWith("Test.php")) {
        return [];
      }

      const text = document.getText();
      const regexPest = /\b(it|test|describe)\s*\(\s*['"`](.*?)['"`]/g;
      const regexPhpUnit = /public\s+function\s+(test\w*)\s*\(/g;
      const lenses: vscode.CodeLens[] = [];
      let match;

      // Detect Pest test methods
      while ((match = regexPest.exec(text))) {
        const startPos = document.positionAt(match.index);
        const range = new vscode.Range(startPos, startPos);
        const methodName = match[2];
        if (methodName) {
          const lens = new vscode.CodeLens(range, {
            title: "Run This Test",
            command: "artisanTest.runTestMethod",
            arguments: [document.uri, methodName],
          });
          lenses.push(lens);
        }
      }

      // Detect PHPUnit test methods
      while ((match = regexPhpUnit.exec(text))) {
        const startPos = document.positionAt(match.index);
        const range = new vscode.Range(startPos, startPos);
        const methodName = match[1];
        if (methodName) {
          const lens = new vscode.CodeLens(range, {
            title: "Run This Test",
            command: "artisanTest.runTestMethod",
            arguments: [document.uri, methodName],
          });
          lenses.push(lens);
        }
      }

      return lenses;
    },
  });
  context.subscriptions.push(codeLensProvider);

  const codeActionsProvider = vscode.languages.registerCodeActionsProvider(
    "php",
    {
      provideCodeActions(document, range, context, token) {
        const line = document.lineAt(range.start.line);
        const regexPest = /\b(it|test|describe)\s*\(\s*['"`](.*?)['"`]/g;
        const regexPhpUnit = /public\s+function\s+(test\w*)\s*\(/;
        let match;
        let methodName;

        // Detect Pest test methods
        match = regexPest.exec(line.text);
        if (match) {
          methodName = match[2];
        }

        // Detect PHPUnit test methods
        if (!methodName) {
          match = regexPhpUnit.exec(line.text);
          if (match) {
            methodName = match[1];
          }
        }

        if (methodName) {
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
    }
  );
  context.subscriptions.push(codeActionsProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "artisanTest.runTestMethod",
      async (uri: vscode.Uri, methodName: string) => {
        await runTestMethod(uri, methodName);
      }
    )
  );
}

async function runTestMethod(uri: vscode.Uri, methodName: string) {
  // Pegue o comando configurado pelo usuário
  const phpCommand = vscode.workspace.getConfiguration("artisanTestShortcut").get<string>("phpCommand", "php");
  const args = ["artisan", "test", uri.fsPath, "--filter", methodName];
  const vscodeTask = new vscode.Task(
    { type: "shell", task: "Run Test Method" },
    vscode.TaskScope.Workspace,
    "Run Test Method",
    "shell",
    new vscode.ShellExecution(phpCommand, args),
    []
  );
  await vscode.tasks.executeTask(vscodeTask);
}
