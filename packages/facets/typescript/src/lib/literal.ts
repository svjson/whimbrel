import { BooleanLiteral, NumericLiteral, StringLiteral } from '@babel/types'
import { AST } from './ast'
import { SourceReference } from './reference'

/**
 * Mapping of literal types to their babel AST node types and value types
 */
type LiteralValueType = {
  NumericLiteral: {
    node: NumericLiteral
    value: number
  }
  StringLiteral: {
    node: StringLiteral
    value: string
  }
  BooleanLiteral: {
    node: BooleanLiteral
    value: boolean
  }
}

/**
 * Type-utility for extracting babel AST Node types for literals by their type
 *
 * @template T - The literal type key
 *
 * @return The babel AST Node type for the literal
 */
type LiteralNodeByType<T extends keyof LiteralValueType> = LiteralValueType[T]['node'] & {
  type: T
}

/**
 * Type-utility for short-hand construction and reference to SourceReference types
 * denoting literals
 *
 * @template T - The literal type key
 *
 * @return The Literal SourceReference type
 */
export interface LiteralByType<T extends keyof LiteralValueType>
  extends SourceReference<LiteralValueType[T]['node']> {
  type: T
  category: 'literal'
  value: LiteralValueType[T]['value']
  node: LiteralValueType[T]['node']
  ast: AST
}

/**
 * Factory function for creating Literal SourceReference instances
 *
 * @param ast - The AST containing the literal node
 * @param node - The babel AST literal node
 *
 * @return The Literal SourceReference instance
 */
export const makeLiteral = <T extends keyof LiteralValueType>(
  ast: AST,
  node: LiteralNodeByType<T>
): LiteralByType<T> => {
  return {
    type: node.type,
    category: 'literal',
    value: node.value,
    node: node,
    ast,
  }
}
