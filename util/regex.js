/**
 * Escape a string to be used in a regular expression
 * @param {String} string
 * @returns
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

exports.escapeRegExp = escapeRegExp;
