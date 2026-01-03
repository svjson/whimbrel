import { ObjectExpression } from '@babel/types'
import { ObjectEntryReference, ObjectReference } from './reference'
import { AST } from './ast'
import { describeValueExpression } from './source-lookup'
import { resolveExpression } from './expression'

/**
 * Creates an object reference from an object expression AST node
 *
 * @param ast - The AST containing the object expression
 * @param node - The object expression AST node
 *
 * @return The created ObjectReference
 */
export const makeObjectReference = (
  ast: AST,
  node: ObjectExpression
): ObjectReference => {
  const entries: ObjectEntryReference[] = []

  for (const prop of node.properties) {
    if (prop.type === 'ObjectProperty') {
      if (prop.key.type == 'Identifier') {
        entries.push({
          type: 'ObjectProperty',
          name: prop.key.name,
          value: describeValueExpression(ast, prop.value),
          category: 'entry',
          node: prop,
          ast,
        })
      }
    }
  }

  return {
    type: 'ObjectExpression',
    category: 'expression',
    entries,
    resolutions: [],
    node,
    ast,
  }
}

/**
 * Recursively resolves the properties of an object reference
 *
 * @param object - The object reference to resolve
 * @return Promise that resolves when the properties have been resolved
 */
export const resolveObjectProperties = async (object: ObjectReference) => {
  for (const entry of object.entries) {
    if (entry.value.category === 'expression') {
      entry.value.resolutions = await resolveExpression(object.ast, entry.value.node, {
        nodeRef: entry.value,
      })
    }
  }
}
