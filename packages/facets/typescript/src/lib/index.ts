export {
  findImport,
  locateInstance,
  locateInstanceInAST,
  locateInvocations,
  locateInvocationsInAST,
} from './source-lookup'
export { getLiteral } from './reference'
export { resolveInvocationArguments } from './expression'
export { sourceToAST } from './ast'

export type {
  ArgumentReference,
  EnvironmentVariableReference,
  ExpressionReference,
  IdentifierReference,
  ProcessArgumentReference,
} from './reference'
