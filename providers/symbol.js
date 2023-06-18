const vscode = require("vscode");

class PropertyKeySymbolProvider {
  /**
   * @param {import("vscode").TextDocument} document
   */
  provideDocumentSymbols(document) {
    const propertyKeyRegex = /^\w[\w.-]*/gm;
    const symbols = [];

    let match;
    while ((match = propertyKeyRegex.exec(document.getText()))) {
      const key = match[0];

      const range = new vscode.Range(
        document.positionAt(match.index),
        document.positionAt(match.index + key.length)
      );

      const symbol = new vscode.DocumentSymbol(
        key,
        "",
        vscode.SymbolKind.Key,
        range,
        range
      );

      symbols.push(symbol);
    }

    return symbols;
  }
}

exports.PropertyKeySymbolProvider = PropertyKeySymbolProvider;
