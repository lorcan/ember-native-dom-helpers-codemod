const { createFindAllExpression, isJQuerySelectExpression, addImportStatement } = require('../utils');

function createExpression(j, findArgs) {
  return j.memberExpression(
    createFindAllExpression(j, findArgs),
    j.identifier('length')
  );
}

function isJQueryExpression(j, node) {
  return j.MemberExpression.check(node)
    && isJQuerySelectExpression(j, node.object)
    && j.Identifier.check(node.property)
    && node.property.name === 'length';
}

function transform(file, api) {
  let source = file.source;
  let j = api.jscodeshift;

  let root = j(source);

  let replacements = root
    .find(j.MemberExpression)
    .filter(({ node }) => isJQueryExpression(j, node))
    .replaceWith(({ node }) => createExpression(j, node.object.arguments));

  if (replacements.length > 0) {
    addImportStatement(j, root, ['findAll']);
  }
  return root.toSource({quote: 'single'});
}

module.exports = transform;