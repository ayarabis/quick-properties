const vscode = require("vscode");
const { searchWorkspace, escapeRegExp } = require("../util");

class PropertyKeyHoverProvider {
  /**
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @param {vscode.CancellationToken} token
   * @returns {vscode.ProviderResult<vscode.Hover>}
   */
  provideHover(document, position, token) {
    const range = document.getWordRangeAtPosition(position);
    const hoverWord = document.getText(range);
    const hoverLine = document.lineAt(range.start.line).text;

    const isPropertyKey = /^[a-zA-Z0-9._-]+=/gm.test(hoverLine);

    if (!isPropertyKey) {
      return null;
    }

    const propertyRange = new vscode.Range(
      range.start.line,
      0,
      range.end.line,
      hoverLine.split("=")[0].length + 1
    );

    const hoveredProperty = hoverLine.split("=")[0];

    if (!hoveredProperty.includes(hoverWord)) {
      return null;
    }

    let markDown = "";

    return new Promise(async (resolve, reject) => {
      const locations = await searchWorkspace(
        hoveredProperty,
        document.uri.path
      );

      if (locations.length > 0) {
        for (let i = 0; i < locations.length; i++) {
          const location = locations[i];
          const doc = await vscode.workspace.openTextDocument(location.uri);
          const path = location.uri.path.split("/").slice(-2).join("/");

          const line = location.range.start.line;
          const lineText = doc.lineAt(line).text;
          const value = lineText.split("=")[1];

          const link = location.uri.with({
            fragment: `L${line + 1},${lineText.indexOf(value) + 1}-${
              line + 1
            },${lineText.length + 1}}`,
          });
          markDown += `[${path}](${link.toString()})\n\n`;
          markDown += `${value}\n\n`;
        }
      }

      const usageLocations = await searchWorkspace(
        "${" + hoveredProperty + "}",
        null,
        "**/*.{xml,dwl,properties}"
      );

      // add separator to markdown
      if (markDown !== "") {
        markDown += "---\n\n";
      }
      let usageCount = 0;
      let usegeMarkdown = "";

      if (usageLocations.length > 0) {
        for (let i = 0; i < usageLocations.length; i++) {
          const location = usageLocations[i];
          const doc = await vscode.workspace.openTextDocument(location.uri);
          const path = location.uri.path.split("/").slice(-2).join("/");
          const line = location.range.start.line;
          const lineText = doc.lineAt(line).text;

          const re = new RegExp(
            `(\\$\\{|'|")${escapeRegExp(hoveredProperty)}(\\}|'|")`,
            "gm"
          );
          const matches = Array.from(doc.getText().matchAll(re));

          const link = location.uri.with({
            fragment: `L${line + 1},${lineText.indexOf(hoveredProperty) + 1}-${
              line + 1
            },${
              lineText.indexOf(hoveredProperty) + hoveredProperty.length + 1
            }}`,
          });
          usegeMarkdown += `[${path}](${link.toString()}) (${
            matches.length
          })\n\n`;
          usageCount += matches.length;
        }
      }

      if (markDown === "") {
        resolve(null);
      }

      markDown += `### Usage (${usageCount})\n\n${usegeMarkdown}`;

      const documentation = new vscode.MarkdownString(markDown);

      resolve(new vscode.Hover(documentation, propertyRange));
    });
  }
}

exports.PropertyKeyHoverProvider = PropertyKeyHoverProvider;
