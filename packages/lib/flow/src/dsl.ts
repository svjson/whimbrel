import { WhimbrelContext } from '@whimbrel/core-api'

/**
 * Type-helper for dynamically constructing a type-safe flow context during
 * the FlowBuilder DSL chain.
 *
 * This utility type allows adding a new key-value pair to the context while
 * preserving the existing context properties.
 *
 * @template C - The current context type.
 * @template K - The key to add to the context.
 * @template V - The value type associated with the key.
 */
export type ExtendNS<C, K extends string, V> = C &
  Record<K, V> & { [P in keyof C as P extends K ? never : P]: C[P] }

export type LetValueProvider<T, NS> = (ns: NS) => T | Promise<T>

export type LetValue<T, NS> = LetValueProvider<T, NS> | T

export interface NameValuePair {
  name: string
  value: any
}

export type LetJournalFormatter = (letResult: NameValuePair) => NameValuePair
export type LetJournalPrivateFunction = (letResult: NameValuePair) => boolean

export type LetJournalOption = LetJournalFormatter | string
export type LetPrivateOption = LetJournalPrivateFunction | boolean

export interface LetOptionParams {
  journal?: LetJournalOption
  private?: LetPrivateOption
}

export type LetOptions = LetOptionParams | LetJournalOption | boolean

export type LetForm<NS> = <T, LN extends string>(
  name: LN,
  value: LetValue<T, NS>,
  options?: LetOptions
) => FlowBuilder<ExtendNS<NS, LN, Awaited<T>>>

export type DoForm<NS> = <T>(fn: (ns: NS) => T | Promise<T>) => FlowBuilder<NS>

export interface FlowRunner {
  run(): Promise<any>
}

export interface FlowBuilder<NS> {
  let: LetForm<NS>
  do: DoForm<NS>
  run: () => Promise<void>
}

export interface FlowForm {
  type: string
  run: () => Promise<any>
}

export interface Scope {
  parentScope?: Scope
  namespace: any
}

export interface Flow {
  ctx: WhimbrelContext
  scopes: Scope[]
  forms: FlowForm[]
  break: boolean
  getNamespace<NS>(): NS
}

export const pushScope = (flow: Flow) => {
  const parentScope = flow.scopes.at(-1) ?? { namespace: {} }
  const scope = {
    parent: parentScope,
    namespace: { ...parentScope.namespace },
  }
  flow.scopes.push(scope)
  return scope
}
