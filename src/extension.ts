import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("artisanTest.runTest", () => {
      runTask("Artisan Test");
    }),
    vscode.commands.registerCommand("artisanTest.runTestFile", () => {
      runTask("Artisan Test File");
    }),
    vscode.commands.registerCommand("artisanTest.runTestFilter", () => {
      runTask("Artisan Test Filter");
    }),
    vscode.commands.registerCommand("artisanTest.runTestDirty", () => {
      runTask("Artisan Test Dirty");
    })
  );
}

function runTask(taskName: string) {
  const tasks = [
    {
      label: "Artisan Test",
      type: "shell",
      command: "php",
      args: ["artisan", "test"],
      group: {
        kind: "test",
        isDefault: true,
      },
      presentationOptions: {
        reveal: vscode.TaskRevealKind.Always,
        panel: vscode.TaskPanelKind.Shared,
      },
      problemMatchers: [],
    },
    {
      label: "Artisan Test Parallel",
      type: "shell",
      command: "php",
      args: ["artisan", "test", "--parallel"],
      group: {
        kind: "test",
        isDefault: true,
      },
      presentationOptions: {
        reveal: vscode.TaskRevealKind.Always,
        panel: vscode.TaskPanelKind.Shared,
      },
      problemMatchers: [],
    },
    {
      label: "Artisan Test File",
      type: "shell",
      command: "php",
      args: ["artisan", "test", "${file}"],
      group: {
        kind: "test",
        isDefault: true,
      },
      presentationOptions: {
        reveal: vscode.TaskRevealKind.Always,
        panel: vscode.TaskPanelKind.Shared,
      },
      problemMatchers: [],
    },
    {
      label: "Artisan Test Filter",
      type: "shell",
      command: "php",
      args: ["artisan", "test", "--filter", "${input:filterTag}"],
      group: {
        kind: "test",
        isDefault: true,
      },
      presentationOptions: {
        reveal: vscode.TaskRevealKind.Always,
        panel: vscode.TaskPanelKind.Shared,
      },
      problemMatchers: [],
    },
    {
      label: "Artisan Test Dirty",
      type: "shell",
      command: "php",
      args: ["artisan", "test", "--dirty"],
      group: {
        kind: "test",
        isDefault: true,
      },
      presentationOptions: {
        reveal: vscode.TaskRevealKind.Always,
        panel: vscode.TaskPanelKind.Shared,
      },
      problemMatchers: [],
    },
  ];

  const task = tasks.find((t) => t.label === taskName);
  if (task) {
    if (taskName === "Artisan Test") {
      vscode.window
        .showQuickPick(
          [
            { label: "All Files", description: "" },
            { label: "All Files With Parallel", description: "--parallel" },
            { label: "Files Dirty", description: "--dirty" },
          ],
          {
            placeHolder: "Select the test type",
          }
        )
        .then((selection) => {
          if (selection) {
            const args = ["artisan", "test"];
            if (selection.description) {
              args.push(selection.description);
            }
            const vscodeTask = new vscode.Task(
              { type: task.type, task: task.label },
              vscode.TaskScope.Workspace,
              task.label,
              task.type,
              new vscode.ShellExecution(task.command, args),
              task.problemMatchers
            );
            vscode.tasks.executeTask(vscodeTask);
          }
        });
    } else if (taskName === "Artisan Test Filter") {
      vscode.window
        .showInputBox({ prompt: "Enter the filter tag for the test" })
        .then((filterTag) => {
          if (filterTag) {
            const vscodeTask = new vscode.Task(
              { type: task.type, task: task.label },
              vscode.TaskScope.Workspace,
              task.label,
              task.type,
              new vscode.ShellExecution(task.command, [
                "artisan",
                "test",
                "--filter",
                filterTag,
              ]),
              task.problemMatchers
            );
            vscode.tasks.executeTask(vscodeTask);
          }
        });
    } else {
      const vscodeTask = new vscode.Task(
        { type: task.type, task: task.label },
        vscode.TaskScope.Workspace,
        task.label,
        task.type,
        new vscode.ShellExecution(task.command, task.args),
        task.problemMatchers
      );
      vscode.tasks.executeTask(vscodeTask);
    }
  } else {
    vscode.window.showErrorMessage(`Task ${taskName} not found`);
  }
}

export function deactivate() {}
