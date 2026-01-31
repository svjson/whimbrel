export {
  findIdentifierDefinition,
  findImportBySource,
  findImportedIdentifier,
  locateInstance,
  locateInstanceInAST,
  locateInvocations,
  locateInvocationsInAST,
  lookupValue,
  lookup,
} from './source-lookup'
export { getLiteral } from './reference'
export { resolveExpression, resolveInvocationArguments } from './expression'
export { findNode, findRecursive, sourceToAST } from './ast'

export type {
  SourceReference,
  BuiltInIdentifierReference,
  ValueExpression,
  EnvironmentVariableReference,
  InvocationExpressionReference,
  ExpressionReference,
  ExpressionResolution,
  IdentifierReference,
  ProcessArgumentReference,
} from './reference'

export type { LookupValueResponse, ResolvedCandidate } from './source-lookup'
