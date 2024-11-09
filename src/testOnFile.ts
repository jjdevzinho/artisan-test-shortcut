import * as vscode from "vscode";

export async function activateTestDecorations(
  context: vscode.ExtensionContext
) {
  let codeLensProvider: vscode.Disposable | undefined;
  let hoverProvider: vscode.Disposable | undefined;
  let codeActionsProvider: vscode.Disposable | undefined;

  async function registerProviders() {
    const config = vscode.workspace.getConfiguration("artisanTest");

    if (config.get("enableCodeLens")) {
      codeLensProvider = vscode.languages.registerCodeLensProvider("php", {
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
      context.subscriptions.push(codeLensProvider);
    }

    if (config.get("enableHover")) {
      hoverProvider = vscode.languages.registerHoverProvider("php", {
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
      context.subscriptions.push(hoverProvider);
    }

    if (config.get("enableCodeActions")) {
      codeActionsProvider = vscode.languages.registerCodeActionsProvider(
        "php",
        {
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
        }
      );
      context.subscriptions.push(codeActionsProvider);
    }
  }

  function unregisterProviders() {
    if (codeLensProvider) {
      codeLensProvider.dispose();
    }
    if (hoverProvider) {
      hoverProvider.dispose();
    }
    if (codeActionsProvider) {
      codeActionsProvider.dispose();
    }
  }

  await registerProviders();

  vscode.workspace.onDidChangeConfiguration(async (e) => {
    if (
      e.affectsConfiguration("artisanTest.enableCodeLens") ||
      e.affectsConfiguration("artisanTest.enableHover") ||
      e.affectsConfiguration("artisanTest.enableCodeActions")
    ) {
      unregisterProviders();
      await registerProviders();
    }
  });

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
  const args = ["artisan", "test", uri.fsPath, "--filter", methodName];
  const vscodeTask = new vscode.Task(
    { type: "shell", task: "Run Test Method" },
    vscode.TaskScope.Workspace,
    "Run Test Method",
    "shell",
    new vscode.ShellExecution("php", args),
    []
  );
  await vscode.tasks.executeTask(vscodeTask);
}
