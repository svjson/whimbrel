import { ObjectExpression } from '@babel/types'
import { ObjectEntryReference, ObjectReference } from './reference'
import { AST } from './ast'
import { describeValueExpression } from './source-lookup'

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
