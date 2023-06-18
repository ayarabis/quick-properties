const vscode = require("vscode");

const {
  PropertyKeySymbolProvider,
  PropertyKeyHoverProvider,
} = require("./providers");

const { renameAction } = require("./actions");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      { language: "java-properties" },
      new PropertyKeyHoverProvider()
    ),
    vscode.languages.registerDocumentSymbolProvider(
      { language: "java-properties" },
      new PropertyKeySymbolProvider()
    ),
    vscode.commands.registerCommand("quick-properties.rename", renameAction)
  );
}

module.exports = {
  activate,
};
