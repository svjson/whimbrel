export {
  findImportBySource,
  findImportedIdentifier,
  locateInstance,
  locateInstanceInAST,
  locateInvocations,
  locateInvocationsInAST,
} from './source-lookup'
export { getLiteral } from './reference'
export { resolveExpression, resolveInvocationArguments } from './expression'
export { findRecursive, sourceToAST } from './ast'

export type {
  SourceReference,
  ArgumentReference,
  EnvironmentVariableReference,
  ExpressionReference,
  ExpressionResolution,
  IdentifierReference,
  ProcessArgumentReference,
} from './reference'
