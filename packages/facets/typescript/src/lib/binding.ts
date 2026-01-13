import { Identifier, MemberExpression } from '@babel/types'
import { AST } from './ast'
import {
  BuiltInIdentifierReference,
  EnvironmentVariableReference,
  InvocationExpressionReference,
  ProcessArgumentReference,
  SyntheticValue,
} from './reference'
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
    resolutions: [],
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

export const resolveBinding = async (
  ast: AST,
  identifier: Identifier
): Promise<BuiltInIdentifierReference | undefined> => {
  switch (identifier.name) {
    case 'Number':
      return {
        type: 'Identifier',
        category: 'builtin',
        name: identifier.name,
        ast,
        node: identifier,
      }
  }
  return undefined
}

export const resolveBuiltInFunctionCall = async (
  callExpr: InvocationExpressionReference
) => {
  switch (callExpr.name) {
    case 'Number':
      const [arg] = callExpr.arguments
      if (arg && arg.category === 'literal') {
        const val = Number(arg.value)
        if (typeof val === 'number') {
          return {
            type: 'SyntheticValue',
            category: 'literal',
            valueType: 'number',
            value: val,
          } satisfies SyntheticValue<'number'>
        }
      }
  }
}
