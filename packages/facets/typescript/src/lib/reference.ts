import {
  ArrowFunctionExpression,
  CallExpression,
  Expression,
  FunctionDeclaration,
  Identifier,
  ImportDeclaration,
  MemberExpression,
  Node,
  ObjectExpression,
  ObjectProperty,
  PrivateName,
  VariableDeclaration,
} from '@babel/types'

import { AST, ObjectPathPart } from './ast'
import { LiteralByType } from './literal'

/**
 * Base interface for a reference to a segment of a TypeScript source file
 *
 * SourceReferences basically wrap a babel AST node and attaches relevant
 * semantic meaning for source-lookup, as well as a reference back to the
 * full AST that is being referenced.
 */
export interface SourceReference<NT extends Node = Node> {
  type: string
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
  expression: ValueExpression
}

/**
 * Source reference that describes a function declaration
 */
export interface FunctionDeclarationReference
  extends SourceReference<FunctionDeclaration | ArrowFunctionExpression> {
  type: 'FunctionDeclaration'
  /**
   * The Identifier-node that this function declaration is assigned to,
   * if any.
   *
   * This can be used to look up references and invocations of this
   * particular declaration.
   */
  id?: Identifier
  /**
   * The name of the function, if bound to and identifier.
   * Equivalent to id.name
   */
  name: string

  exports: ExportMetadata[]
}

/**
 * Source reference that describes a function argument declaration
 *
 * Structurally extends FunctionDeclarationReference, with the exception of
 * 'type'.
 *
 * Adds the `argument` property to signify which particular argument
 * that is of interest.
 */
export interface FunctionArgumentDeclaration
  extends SourceReference<FunctionDeclaration | ArrowFunctionExpression> {
  type: 'FunctionArgumentDeclaration'
  exports: ExportMetadata[]
  id?: Identifier
  name: string
  argument: ArgumentDescription
}

/**
 * Union type that allows FunctionArgumentDeclaration references to be used
 * as FunctionDeclarationReference instances.
 */
export type FunctionReference = FunctionDeclarationReference | FunctionArgumentDeclaration

/**
 * Auxiliary interface used by FunctionArgumentDeclaration that describes
 * a particular function argument.
 */
export interface ArgumentDescription {
  type: 'positional' | 'unknown'
  name?: string
  index?: number
  node: Identifier
}

/**
 * Source reference union for any expression that declares an identifier in
 * a namespace.
 */
export type IdentifierAssignment =
  | InstanceDeclaration
  | IdentifierImportReference
  | FunctionArgumentDeclaration

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

export interface ObjectReference extends SourceReference<ObjectExpression> {
  type: 'ObjectExpression'
  category: 'expression'
  entries: ObjectEntryReference[]
  resolutions: ExpressionResolution[]
}

export interface PropertyReference extends SourceReference<ObjectProperty> {
  type: 'ObjectProperty'
  category: 'entry'
  name: string
  value: ValueExpression
}

export type ObjectEntryReference = PropertyReference

/**
 * Source reference that describes a function invocation expression
 */
export interface InvocationExpressionReference extends SourceReference<CallExpression> {
  type: 'CallExpression'
  category: 'expression'
  arguments: ValueExpression[]
  resolutions: ExpressionResolution[]
}

export interface IdentifierReference extends SourceReference<Identifier> {
  type: 'Identifier'
  name: string
  category: 'expression'
  resolutions: ExpressionResolution[]
}

export interface ObjectPathReference extends SourceReference<MemberExpression> {
  type: 'ObjectPathReference'
  category: 'expression'
  root: Identifier
  path: ObjectPathPart[]
  resolutions: []
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
  | ObjectPathReference
  | AnyExpression

/**
 * Union type that describes an invocation argument expression
 */
export type ValueExpression = LiteralReference | ExpressionReference

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
