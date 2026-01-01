import { WhimbrelContext } from '@whimbrel/core-api'
import { parse, ParseResult } from '@babel/parser'
import { BooleanLiteral, Node, NumericLiteral, StringLiteral } from '@babel/types'

export interface AST {
  nodes: Node[]
  parseResult: ParseResult
  source: string
  sourceFile?: string
}

export type LiteralNode = NumericLiteral | StringLiteral | BooleanLiteral

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

export const filePathToAST = async (
  ctx: WhimbrelContext,
  filePath: string
): Promise<AST> => {
  const fileContents = (await ctx.disk.read(filePath, 'utf8')) as string

  return sourceToAST(fileContents, filePath)
}

export const getNodeLiteral = (ast: AST, node: Node) => {
  return ast.source.substring(node.start, node.end)
}

export const isLiteralNode = (a: Node): a is LiteralNode => {
  return ['NumericLiteral', 'StringLiteral', 'BooleanLiteral'].includes(a.type)
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
