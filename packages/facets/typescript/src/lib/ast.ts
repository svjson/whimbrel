import { WhimbrelContext } from '@whimbrel/core-api'
import { parse, ParseResult } from '@babel/parser'
import { BooleanLiteral, Node, NumericLiteral, StringLiteral } from '@babel/types'
import traverse, { NodePath } from '@babel/traverse'

export interface AST {
  nodes: Node[]
  parseResult: ParseResult
  source: string
  sourceFile?: string
}

/**
 * Union type for all literal Babel AST nodes considered as Literal in the
 * context of this library.
 */
export type LiteralNode = NumericLiteral | StringLiteral | BooleanLiteral

/**
 * Parse source code into a Babel AST.
 *
 * @param sourceCode - The source code to parse
 * @param filePath - Optional file path of the source code
 *
 * @return The parsed AST
 */
export const sourceToAST = (sourceCode: string, filePath?: string): AST => {
  const result = parse(sourceCode, {
    sourceType: 'module',
    plugins: [
      'typescript',
      'jsx',
      'decorators-legacy',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
    ],
  })
  return {
    nodes: result.program.body,
    parseResult: result,
    source: sourceCode,
    sourceFile: filePath,
  }
}

/**
 * Read a file from the WhimbrelContext FileSystem and parse its contents into
 * a Babel AST.
 *
 * @param ctx - The Whimbrel context
 * @param filePath - The path of the file to read and parse
 *
 * @return The parsed AST
 */
export const filePathToAST = async (
  ctx: WhimbrelContext,
  filePath: string
): Promise<AST> => {
  const fileContents = (await ctx.disk.read(filePath, 'utf8')) as string

  return sourceToAST(fileContents, filePath)
}

/**
 * Get the literal source code for a given AST node.
 *
 * @param ast - The AST containing the node
 * @param node - The AST node to get the literal for
 *
 * @return The literal source code of the node
 */
export const getNodeLiteral = (ast: AST, node: Node) => {
  return ast.source.substring(node.start, node.end)
}

/**
 * Determine if a given AST node matches a traversal NodePath node.
 *
 * This is required because the Node instances emitted from @babel/traverse
 * do not pass comparison with ===, even though they are semantically the
 * same for all intents and purposes.
 *
 * @param pathNode - The Node from the traversal NodePath
 * @param node - The AST node to compare
 *
 * @return True if the nodes match, false otherwise
 */
export const isTraversalNode = (pathNode: Node, node: Node): boolean => {
  return pathNode.type === node.type && pathNode.start === node.start
}

/**
 * Determine if a given AST node is a LiteralNode.
 *
 * @param a - The AST node to check
 * @return True if the node is a LiteralNode, false otherwise
 */
export const isLiteralNode = (a: Node): a is LiteralNode => {
  return ['NumericLiteral', 'StringLiteral', 'BooleanLiteral'].includes(a.type)
}

/**
 * Criteria for locating AST nodes with `findNode`.
 *
 * Nodes must match all non-null criteria to be considered a match.
 */
export interface NodeCriteria {
  /**
   * The AST node type to match. If non-null, the node must be of this type.
   */
  type?: string
  /**
   * The name of the node to match. If non-null, the node must be of a type
   * that has the `name` property, e.g, Identifier, and have a value that
   * equal this name.
   */
  name?: string
  /**
   * The literal source code of the node to match. If non-null, the node's
   * literal source code(as extracted from the AST) must equal this value.
   */
  literal?: string
  /**
   * Criteria for the parent node. If non-null, the node's parent must
   * fully match these criteria.
   */
  parent?: NodeCriteria
}

/**
 * Determine if a NodePath matches the given NodeCriteria.
 *
 * @param ast - The AST containing the node
 * @param nodePath - The NodePath to check
 * @param criteria - The criteria to match
 *
 * @return True if the NodePath matches all the criteria, false otherwise
 */
const matchesCriteria = (ast: AST, nodePath: NodePath, criteria: NodeCriteria) => {
  if (criteria.type && nodePath.type !== criteria.type) return false
  if (criteria.name && (nodePath.node as any).name !== criteria.name) return false
  if (criteria.literal && getNodeLiteral(ast, nodePath.node) !== criteria.literal)
    return false
  if (criteria.parent && !matchesCriteria(ast, nodePath.parentPath, criteria.parent))
    return false

  return true
}

/**
 * Find a Babel AST Node matching the given criteria.
 *
 * Returns the first node that fully matches all of the given
 * criteria.
 *
 * @param ast - The AST to search
 * @param criteria - The criteria to match
 *
 * @return The located AST node, or undefined if not found
 */
export const findNode = <T extends Node = Node>(
  ast: AST,
  criteria: NodeCriteria
): T | undefined => {
  let node: Node | undefined
  const matcher = (path: NodePath) => {
    if (matchesCriteria(ast, path, criteria)) {
      node = path.node
      path.stop()
    }
  }

  traverse(ast.parseResult, {
    [criteria.type ?? 'enter']: matcher,
  })

  return node as T
}

/**
 * Recursively find Babel AST Nodes of type `exprTypes`.
 *
 * @param node - The AST node to search
 * @param exprTypes - The expression type or array of expression types to locate
 *
 * @return Array of located AST nodes
 */
export const findRecursive = (
  node: Node | Node[],
  exprTypes: string | string[]
): Node[] => {
  if (!Array.isArray(exprTypes)) exprTypes = [exprTypes]

  if (Array.isArray(node)) {
    return node.flatMap((n) => findRecursive(n, exprTypes))
  }

  const found: Node[] = []

  if (exprTypes.includes(node.type)) {
    found.push(node)
  }

  for (const value of Object.values(node)) {
    for (const maybeNode of Array.isArray(value) ? value : [value]) {
      if (maybeNode && typeof maybeNode.type === 'string') {
        found.push(...findRecursive(maybeNode, exprTypes))
      }
    }
  }
  return found
}
