import { Identifier, LogicalExpression, MemberExpression, Node } from '@babel/types'
import { AST, getNodeLiteral, isLiteralNode, isTraversalNode } from './ast'
import {
  ExpressionResolution,
  FunctionArgumentDeclaration,
  InvocationExpressionReference,
  LiteralReference,
  ObjectReference,
  SourceReference,
} from './reference'
import { makeLiteral } from './literal'
import { findIdentifierDefinition } from './source-lookup'
import { resolveObjectProperties } from './object'
import { findFunctionInvocations } from './function'

export interface ExpressionResolutionOptions<
  R extends SourceReference = SourceReference,
> {
  acceptIdentifier?: boolean
  nodeRef?: R
}

/**
 * Resolves a logical expression by resolving its constituent expressions.
 *
 * Recursively attempts to resolve the resulting expression to its possible
 * evaluations or references.
 *
 * @param ast - The AST containing the expression
 * @param node - The logical expression AST node
 * @param _opts - Optional resolution options
 *
 * @return Array of resolved expression references
 */
const resolveLogicalExpression = async (
  ast: AST,
  node: LogicalExpression,
  _opts: ExpressionResolutionOptions
): Promise<ExpressionResolution[]> => {
  if (node.operator === '||' || node.operator === '??') {
    return [
      ...(await resolveExpression(ast, node.left)),
      ...(await resolveExpression(ast, node.right)),
    ]
  }

  console.warn(`Unhandled logical expression: "${getNodeLiteral(ast, node)}"`)
  return []
}

/**
 * Resolves a member expression into its possible literal references or
 * external resources.
 *
 * @param ast - The AST containing the expression
 * @param node - The member expression AST node
 * @param _opts - Optional resolution options
 *
 * @return Array of resolved expression references
 */
const resolveMemberExpression = async (
  ast: AST,
  node: MemberExpression,
  _opts: ExpressionResolutionOptions
): Promise<ExpressionResolution[]> => {
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

  console.warn(`Unhandled member expression: "${getNodeLiteral(ast, node)}"`)
  return []
}

/**
 * Resolves an identifier expression into its possible literal references or
 * external resources.
 *
 * @param ast - The AST containing the expression
 * @param node - The identifier AST node
 * @param opts - Optional resolution options
 *
 * @return Array of resolved expression references
 */
const resolveIdentifierExpression = async (
  ast: AST,
  node: Identifier,
  opts: ExpressionResolutionOptions
): Promise<ExpressionResolution[]> => {
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

  const decl = findIdentifierDefinition(ast, node)

  return (
    await Promise.all(
      decl.map((ref) => {
        if (ref.type === 'VariableDeclaration') {
          return resolveExpression(ast, ref.expression.node)
        }
        return resolveExpression(ast, ref.node, { nodeRef: ref })
      })
    )
  ).flatMap((r) => r)
}

/**
 * Resolves a function argument expression into its possible literal references or
 * external resources.
 *
 * @param ast - The AST containing the expression
 * @param funcDecl - The function argument declaration reference
 *
 * @return Array of resolved expression references
 */
export const resolveFunctionArgumentExpression = async (
  ast: AST,
  funcDecl: FunctionArgumentDeclaration
) => {
  const invocations = findFunctionInvocations(ast, funcDecl)
  return (
    await Promise.all(
      invocations.map((inv) => {
        if (funcDecl.argument.index) {
          return resolveExpression(ast, inv.arguments[funcDecl.argument.index])
        }
      })
    )
  )
    .flat()
    .filter(Boolean)
}

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
  opts?: ExpressionResolutionOptions
): Promise<ExpressionResolution[]> => {
  switch (node.type) {
    case 'NumericLiteral':
    case 'StringLiteral':
    case 'BooleanLiteral':
      return [makeLiteral(ast, node) as LiteralReference]
    case 'LogicalExpression':
      return resolveLogicalExpression(ast, node, opts)
    case 'MemberExpression':
      return resolveMemberExpression(ast, node, opts)
    case 'Identifier':
      return resolveIdentifierExpression(ast, node, opts)
    case 'FunctionDeclaration':
    case 'ArrowFunctionExpression':
      if (opts?.nodeRef?.type === 'FunctionArgumentDeclaration') {
        return resolveFunctionArgumentExpression(
          ast,
          opts.nodeRef as FunctionArgumentDeclaration
        )
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
      if (arg.type === 'ObjectExpression') {
        await resolveObjectProperties(arg as ObjectReference)
      } else {
        arg.resolutions = await resolveExpression(arg.ast, arg.node)
      }
    }
  }

  return invocation
}
