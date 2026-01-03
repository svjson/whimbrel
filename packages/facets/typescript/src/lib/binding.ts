import { MemberExpression } from '@babel/types'
import { AST } from './ast'
import { EnvironmentVariableReference, ProcessArgumentReference } from './reference'
import { resolveExpression } from './expression'

/**
 * Describe the babel AST node as ProcessArgumentReference
 *
 * @param ast - The AST containing the argument
 * @param node - The MemberExpression node to describe
 */
export const makeProcessArgReference = async (
  ast: AST,
  node: MemberExpression
): Promise<ProcessArgumentReference> => {
  return {
    type: node.type,
    category: 'process-arg',
    argIndex: await resolveExpression(ast, node.property),
    node: node,
    ast,
  }
}

/**
 * Describe the babel AST node as EnvironmentVariableReference
 *
 * @param ast - The AST containing the argument
 * @param node - The MemberExpression node to describe
 */
export const makeProcessEnvReference = async (
  ast: AST,
  node: MemberExpression
): Promise<EnvironmentVariableReference> => {
  return {
    type: node.type,
    category: 'process-env',
    name: await resolveExpression(ast, node.property, { acceptIdentifier: true }),
    node: node,
    ast,
  }
}
