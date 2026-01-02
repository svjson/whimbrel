import {
  CallExpression,
  Identifier,
  ImportDeclaration,
  MemberExpression,
  Node,
  VariableDeclaration,
} from '@babel/types'

import { AST } from './ast'
import { LiteralByType } from './literal'

/**
 * Base interface for a reference to a segment of a TypeScript source file
 *
 * SourceReferences basically wrap a babel AST node and attaches relevant
 * semantic meaning for source-lookup, as well as a reference back to the
 * full AST that is being referenced.
 */
export interface SourceReference<NT extends Node = Node> {
  ast: AST
  node: NT
}

/**
 * Source reference that describes an imported identifier
 */
export interface IdentifierImportReference extends SourceReference<ImportDeclaration> {
  type: 'ImportDeclaration'
  importType: 'named' | 'default'
  name: string
}

/**
 * Source reference that describes a variable declaration of an instance
 */
export interface InstanceDeclaration extends SourceReference<VariableDeclaration> {
  type: 'VariableDeclaration'
  name: string
  exports: ExportMetadata[]
  expression: ArgumentReference
}

/**
 * Source reference union for any expression that declares an identifier in
 * a namespace.
 */
export type IdentifierAssignment = InstanceDeclaration | IdentifierImportReference

/**
 * Source reference that describes a literal value.
 *
 * This is a union type that "generates" concrete SourceReference types
 * using the literalByType type-utility.
 */
export type LiteralReference =
  | LiteralByType<'NumericLiteral'>
  | LiteralByType<'StringLiteral'>
  | LiteralByType<'BooleanLiteral'>

/**
 * Source reference that describes a function invocation expression
 */
export interface InvocationExpressionReference extends SourceReference<CallExpression> {
  type: 'CallExpression'
  category: 'expression'
  arguments: ArgumentReference[]
  resolutions: ExpressionResolution[]
}

export interface IdentifierReference extends SourceReference<Identifier> {
  type: 'Identifier'
  name: string
  category: 'expression'
  resolutions: ExpressionResolution[]
}

/**
 * Source reference that describes a process argument access expression.
 *
 * This is specifically for expressions like `process.argv[2]`, and used in
 * resolution of expressions to signal back to the library callee where and
 * how a value can be controlled.
 */
export interface ProcessArgumentReference extends SourceReference<MemberExpression> {
  type: string
  category: 'process-arg'
  argIndex: ExpressionResolution[]
}

/**
 * Source reference that describes a process environment variable access expression.
 *
 * This is specifically for expressions like `process.env.MY_VAR`, and used in
 * resolution of expressions to signal back to the library callee where and
 * how a value can be controlled.
 */
export interface EnvironmentVariableReference extends SourceReference<Node> {
  type: string
  category: 'process-env'
  name: ExpressionResolution[]
}

/**
 * Fallback SourceReference type for any kind of expression that is not currently
 * handled or recognized by the library.
 *
 * Concrete instances of this type usually signal a dead end in lookup and analysis.
 */
export interface AnyExpression extends SourceReference<Node> {
  type: string
  category: 'expression'
  resolutions: ExpressionResolution[]
}

/**
 * Union type for non-literal expressions
 */
export type ExpressionReference =
  | InvocationExpressionReference
  | IdentifierReference
  | AnyExpression

/**
 * Union type that describes an invocation argument expression
 */
export type ArgumentReference = LiteralReference | ExpressionReference

/**
 * Metadata that can be attached to an expression that also exports itself.
 */
interface ExportMetadata {
  /**
   * Export type
   */
  type: 'default' | 'named'
  /**
   * Exported name
   */
  name: string
}

/**
 * Union type describing a possible resolution of an expression.
 *
 * This includes literals, sub-expressions, process-arg references,
 */
export type ExpressionResolution =
  | LiteralReference
  | ExpressionReference
  | ProcessArgumentReference
  | EnvironmentVariableReference

/**
 * Extract the literal source being referenced by `sourceRef` as it appears
 * verbatim in the source
 *
 * @param sourceRef - The SourceReference pointing to the literal
 *
 * @return The literal source string
 */
export const getLiteral = (sourceRef: SourceReference): string => {
  return sourceRef.ast.source.substring(sourceRef.node.start, sourceRef.node.end)
}
