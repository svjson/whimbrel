import traverse, { Node, NodePath } from '@babel/traverse'
import {
  ArrowFunctionExpression,
  CallExpression,
  FunctionDeclaration,
  Identifier,
} from '@babel/types'
import { AST, isTraversalNode } from './ast'
import {
  ArgumentDescription,
  FunctionArgumentDeclaration,
  FunctionDeclarationReference,
  FunctionReference,
} from './reference'

/**
 * Describe the argument `arg` in the context of function declaration `funDecl`.
 *
 * @param funDecl - The function declaration node
 * @param arg - The argument identifier node
 *
 * @return The described argument
 */
const describeArgument = (
  funDecl: FunctionDeclaration | ArrowFunctionExpression,
  arg: Identifier
): ArgumentDescription => {
  let index = -1
  for (let i = 0; i < funDecl.params.length; i++) {
    if (isTraversalNode(funDecl.params[i], arg)) {
      index = i
      break
    }
  }

  if (index !== -1) {
    return {
      type: 'positional',
      name: arg.name,
      index,
      node: arg,
    } satisfies ArgumentDescription
  }

  return {
    type: 'unknown',
    node: arg,
  } satisfies ArgumentDescription
}

/**
 * Create a FunctionArgumentDeclaration for the given function declaration
 *
 * @param ast - The AST containing the function
 * @param funcDecl - The function declaration node
 * @param argument - The argument node path
 */
export const makeFunctionArgumentDeclaration = (
  ast: AST,
  funcDecl: FunctionDeclaration,
  argument: NodePath<Node>
): FunctionArgumentDeclaration => {
  return {
    type: 'FunctionArgumentDeclaration',
    id: funcDecl.id,
    name: funcDecl.id.name,
    exports: [],
    argument: describeArgument(funcDecl, argument.node as Identifier),
    node: funcDecl,
    ast,
  }
}

/**
 * Create a FunctionArgumentDeclaration for the given arrow function declaration
 * assigned to a variable.
 *
 * @param ast - The AST containing the function
 * @param funcDecl - The arrow function declaration node path
 * @param argument - The argument node path
 *
 * @return The created FunctionArgumentDeclaration
 */
export const makeArrowFunctionArgumentDeclaration = (
  ast: AST,
  funcDecl: NodePath<ArrowFunctionExpression>,
  argument: NodePath<Node>
): FunctionArgumentDeclaration => {
  if (funcDecl.parent?.type === 'VariableDeclarator') {
    const varDecl = funcDecl.parent
    if (varDecl.id.type === 'Identifier') {
      return {
        type: 'FunctionArgumentDeclaration',
        id: varDecl.id,
        name: varDecl.id.name,
        exports: [],
        argument: describeArgument(funcDecl.node, argument.node as Identifier),
        node: funcDecl.node,
        ast,
      }
    }
  }
}

/**
 * Create a FunctionArgumentDeclaration for the given argument node path.
 *
 * @param ast - The AST containing the argument
 * @param argumentNode - The argument node path
 *
 * @return The created FunctionArgumentDeclaration
 */
export const makeArgumentDeclaration = (ast: AST, argumentNode: NodePath<Node>) => {
  const parentPath = argumentNode.parentPath
  const parentNode = parentPath.node
  if (parentNode.type === 'FunctionDeclaration') {
    return makeFunctionArgumentDeclaration(ast, parentNode, argumentNode)
  } else if (parentPath.type === 'ArrowFunctionExpression') {
    return makeArrowFunctionArgumentDeclaration(
      ast,
      parentPath as NodePath<ArrowFunctionExpression>,
      argumentNode
    )
  }

  console.warn('Unhandled argument function type:', parentPath.type)
}

export const findReturnValues = (ast: AST, funcDecl: NodePath<FunctionDeclaration>) => {
  const returnValues = []
  funcDecl.traverse({
    ReturnStatement(path) {
      if (path.node.argument) {
        returnValues.push(path.get('argument'))
      }
    },
  })
  return returnValues
}

/**
 * Find all invocations of the given function declaration in the AST.
 *
 * @param ast - The AST to search
 * @param funcDecl - The function declaration reference
 * @return Array of CallExpression nodes invoking the function
 */
export const findFunctionInvocations = (
  ast: AST,
  funcDecl: FunctionReference
): NodePath<CallExpression>[] => {
  const invocations = []

  traverse(ast.parseResult, {
    [funcDecl.node.type](path: NodePath<Node>) {
      if (isTraversalNode(path.node, funcDecl.node)) {
        const id = funcDecl.type === 'Identifier' ? funcDecl.node : funcDecl.id
        if (id) {
          const binding = path.scope.getBinding(id.name)
          invocations.push(
            ...binding.referencePaths
              .filter(
                (refPath) =>
                  refPath.parentPath?.isCallExpression() && refPath.parentKey === 'callee'
              )
              .map((refPath) => refPath.parentPath)
          )
        }
        path.stop()
      }
    },
  })

  return invocations
}
