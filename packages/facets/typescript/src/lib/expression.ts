import { Node } from '@babel/types'
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
import {
  describeValueExpression,
  findIdentifierDefinition,
  locateInstanceInAST,
} from './source-lookup'
import { resolveObjectProperties } from './object'
import traverse from '@babel/traverse'

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
  opts?: { acceptIdentifier?: boolean; nodeRef?: SourceReference }
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

  if (opts?.nodeRef?.type === 'FunctionArgumentDeclaration') {
    const nodeRef = opts.nodeRef as FunctionArgumentDeclaration
    const invocations = []

    traverse(ast.parseResult, {
      FunctionDeclaration(path) {
        if (isTraversalNode(path.node, node)) {
          const id = path.node.id
          if (id) {
            const binding = path.scope.getBinding(id.name)
            invocations.push(
              ...binding.referencePaths
                .filter(
                  (refPath) =>
                    refPath.parentPath?.isCallExpression() &&
                    refPath.parentKey === 'callee'
                )
                .map((refPath) => refPath.parent)
            )
          }
          path.stop()
        }
      },
    })

    return (
      await Promise.all(
        invocations.map((inv) => {
          if (nodeRef.argument.index) {
            return resolveExpression(ast, inv.arguments[nodeRef.argument.index])
          }
        })
      )
    )
      .flat()
      .filter(Boolean)
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
