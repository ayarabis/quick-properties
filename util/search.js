const vscode = require("vscode");
/**
 * @param {string} searchText
 * @param {string} exclude
 * @returns {Promise<vscode.Location[]>}
 */
async function searchWorkspace(
  searchText,
  exclude,
  glob = "**/*/*.properties"
) {
  //   get all properties files
  const uris = (await vscode.workspace.findFiles(glob)).filter(
    (e) => !e.path.includes("target")
  );
  const results = [];

  //   iterate over the uris using normal for loop
  for (let i = 0; i < uris.length; i++) {
    const uri = uris[i];
    if (uri.path.includes(exclude) || uri.path.includes("target")) {
      continue;
    }
    // read the file content
    const doc = await vscode.workspace.openTextDocument(uri);
    const content = doc.getText();

    //   search for the text within the content
    const index = content.indexOf(searchText);

    if (index > -1) {
      //   create a range
      const range = new vscode.Range(
        doc.positionAt(index),
        doc.positionAt(index + searchText.length)
      );

      //   create a location
      const location = new vscode.Location(uri, range);

      results.push(location);
    }
  }

  //   sort the results
  results.sort((a, b) => {
    if (a.uri.path < b.uri.path) {
      return -1;
    }
    if (a.uri.path > b.uri.path) {
      return 1;
    }
    return 0;
  });

  return results;
}

exports.searchWorkspace = searchWorkspace;
