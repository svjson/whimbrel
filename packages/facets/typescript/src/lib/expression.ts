import { Node } from '@babel/types'
import { AST, getNodeLiteral, isLiteralNode } from './ast'
import {
  ExpressionResolution,
  InvocationExpressionReference,
  LiteralReference,
} from './reference'
import { makeLiteral } from './literal'

/**
 * Resolves an expression AST node into its possible literal references or
 * external resources.
 *
 * @param ast - The AST containing the expression
 * @param node - The expression AST node to resolve
 * @param opts - Optional resolution options
 *
 * @return Array of resolved expression references
 */
export const resolveExpression = async (
  ast: AST,
  node: Node,
  opts?: { acceptIdentifier?: boolean }
): Promise<ExpressionResolution[]> => {
  if (isLiteralNode(node)) {
    return [makeLiteral(ast, node) as LiteralReference]
  }
  if (node.type === 'LogicalExpression') {
    if (node.operator === '||' || node.operator === '??') {
      return [
        ...(await resolveExpression(ast, node.left)),
        ...(await resolveExpression(ast, node.right)),
      ]
    }
  }
  if (node.type === 'MemberExpression') {
    const objLiteral = getNodeLiteral(ast, node.object)
    switch (objLiteral) {
      case 'process.argv':
        return [
          {
            type: node.type,
            category: 'process-arg',
            argIndex: await resolveExpression(ast, node.property),
            node: node,
            ast,
          },
        ]
      case 'process.env':
        return [
          {
            type: node.type,
            category: 'process-env',
            name: await resolveExpression(ast, node.property, { acceptIdentifier: true }),
            node: node,
            ast,
          },
        ]
    }
  }
  if (node.type === 'Identifier') {
    if (opts?.acceptIdentifier) {
      return [
        {
          type: 'Identifier',
          name: node.name,
          category: 'expression',
          resolutions: [],
          node: node,
          ast,
        },
      ]
    }
  }

  return []
}

/**
 * Decorates an InvocationExpressionReference by attempting to resolve
 * the argument expression.
 *
 * Any argument references of category 'expression' will have its, presumably
 * empty, resolutions array overwritten by the results of resolveExpression.
 *
 * @param invocation - The invocation expression to resolve arguments for
 *
 * @return The invocation expression with resolved arguments
 */
export const resolveInvocationArguments = async (
  invocation: InvocationExpressionReference
): Promise<InvocationExpressionReference> => {
  for (const arg of invocation.arguments) {
    if (arg.category === 'expression') {
      arg.resolutions = await resolveExpression(arg.ast, arg.node)
    }
  }

  return invocation
}
