const vscode = require("vscode");
const { searchWorkspace } = require("../util");

async function renameAction() {
  const editor = vscode.window.activeTextEditor;
  const selection = editor.selection;
  const lineText = editor.document.lineAt(selection.start.line).text;

  const key = lineText.split("=")[0].trim();

  if (selection.start.character > lineText.indexOf("=")) {
    return;
  }

  const newName = await vscode.window.showInputBox({
    value: key,
    prompt: "Enter new property name",
  });

  if (newName) {
    const workspaceEdit = new vscode.WorkspaceEdit();

    const locations = await searchWorkspace(
      key,
      null,
      "**/*/*.{properties,dwl,xml}"
    );
    const docs = [];
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      const doc = await vscode.workspace.openTextDocument(location.uri);
      const content = doc.getText();

      const re = new RegExp(key, "gm");
      const matches = Array.from(content.matchAll(re));

      for (let x = 0; x < matches.length; x++) {
        const match = matches[x];
        const pos = doc.positionAt(match.index);
        const lineText = doc.lineAt(pos).text;

        const keyIndex = lineText.indexOf(key);
        const range = new vscode.Range(
          new vscode.Position(pos.line, keyIndex),
          new vscode.Position(pos.line, keyIndex + key.length)
        );

        workspaceEdit.replace(location.uri, range, newName);
        docs.push(doc);
      }
    }
    await vscode.workspace.applyEdit(workspaceEdit);
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      doc.save();
    }
    // await vscode.workspace.saveAll();
  }
}

exports.renameAction = renameAction;
