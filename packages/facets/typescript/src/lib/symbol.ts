import { AST } from './ast'
import { Identifier } from '@babel/types'
import { IdentifierReference } from './reference'

export const makeIdentifierReference = (
  ast: AST,
  node: Identifier
): IdentifierReference => {
  return {
    type: 'Identifier',
    name: node.name,
    category: 'expression',
    resolutions: [],
    node,
    ast,
  }
}
