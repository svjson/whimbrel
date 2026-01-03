import {
  Identifier,
  LogicalExpression,
  MemberExpression,
  Node,
  ObjectExpression,
} from '@babel/types'
import { AST, getNodeLiteral } from './ast'
import {
  ExpressionResolution,
  FunctionArgumentDeclaration,
  InvocationExpressionReference,
  LiteralReference,
  ObjectPathReference,
  ObjectReference,
  SourceReference,
} from './reference'
import { makeLiteral } from './literal'
import { findIdentifierDefinition } from './source-lookup'
import {
  extractObjectPath,
  makeObjectPathReference,
  makeObjectReference,
  resolveObjectProperties,
} from './object'
import { findFunctionInvocations } from './function'
import { makeProcessArgReference, makeProcessEnvReference } from './binding'

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

  // First check for special bindings
  switch (objLiteral) {
    case 'process.argv':
      return [await makeProcessArgReference(ast, node)]
    case 'process.env':
      return [await makeProcessEnvReference(ast, node)]
  }

  // Handle regular/arbitrary member expression
  const objPathRef = makeObjectPathReference(ast, node)
  return resolveExpression(ast, node, { nodeRef: objPathRef })
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
  opts?: ExpressionResolutionOptions
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
 * Attempts to fully resolve an object expression and all of its property values.
 *
 * @param ast - The AST containing the expression
 * @param node - The object expression AST node
 * @param _opts - Optional resolution options
 *
 * @return Array of resolved expression references
 */
export const resolveObjectExpression = async (
  ast: AST,
  node: ObjectExpression,
  _opts: ExpressionResolutionOptions
) => {
  const objRef = makeObjectReference(ast, node)
  await resolveObjectProperties(objRef)
  return [objRef]
}

/**
 * Resolves an object path reference into its possible literal references or
 * external resources.
 *
 * @param ast - The AST containing the expression
 * @param objPathRef - The object path reference to resolve
 *
 * @return Array of resolved expression references
 */
export const resolveObjectPathReference = async (
  ast: AST,
  objPathRef: ObjectPathReference
) => {
  const rootResolutions = await resolveIdentifierExpression(ast, objPathRef.root)

  const resolutions = []
  for (const res of rootResolutions) {
    if (res.type === 'ObjectExpression') {
      const path = extractObjectPath(res as ObjectReference, objPathRef.path)
      if (path) {
        resolutions.push(path)
      }
    }
  }

  return resolutions
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
      if (opts?.nodeRef?.type === 'ObjectPathReference') {
        return resolveObjectPathReference(ast, opts.nodeRef as ObjectPathReference)
      }
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
      break
    case 'ObjectExpression':
      return resolveObjectExpression(ast, node, opts)
  }

  // console.warn('Unable to resolve: ', node.type)

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
