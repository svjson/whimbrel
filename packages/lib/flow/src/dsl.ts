import { WhimbrelContext } from '@whimbrel/core-api'

/**
 * Type-utility for dynamically constructing a type-safe flow context during
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

/**
 *
 */
type IterValue<T> = T extends readonly (infer E)[]
  ? E
  : T extends Record<infer K, infer V>
    ? [K, V]
    : never

export type LetValueProvider<T, NS> = (ns: NS) => T | Promise<T>

export type LetValue<T, NS> = LetValueProvider<T, NS> | T

/**
 * A name-value pair representing a variable and its associated value.
 *
 * @template V - The type of the value associated with the name.
 */
export interface NameValuePair<V = any> {
  name: string
  value?: V
}

/**
 * A function that formats a NameValuePair for logging in the flow journal.
 *
 * @param letResult - The NameValuePair representing the variable name and its value.
 *
 * @returns A formatted NameValuePair for logging.
 *
 * @template V - The type of the value associated with the name.
 * @template J - The type of the formatted value for logging.
 */
export type LetJournalFormatter<V> = (letResult: NameValuePair<V>) => NameValuePair<any>

/**
 * A function that determines if a variable should be marked as private
 * in the flow journal.
 *
 * @param letResult - The NameValuePair representing the variable name and its value.
 *
 * @returns A boolean indicating if the variable is private.
 *
 * @template V - The type of the value associated with the name.
 */
export type LetJournalPrivateFunction<V> = (letResult: NameValuePair<V>) => boolean

/**
 * Options for customizing how a variable is recorded in the flow journal.
 *
 * This can be either a formatter function that transforms the
 * NameValuePair before logging, or a string template that defines
 * the format.
 */
export type LetJournalOption<V> = LetJournalFormatter<V> | string
export type LetPrivateOption<V> = LetJournalPrivateFunction<V> | boolean

/**
 * Options for the `let` form in the FlowBuilder DSL.
 */
export interface LetOptionParams<V> {
  /**
   * Customize how the variable and its resolution is recorded in the flow journal.
   * This can be a formatter function or a string template.
   */
  journal?: LetJournalOption<V>
  /**
   * A flag or function to determine if the variable should be marked as private
   * in the flow journal.
   */
  private?: LetPrivateOption<V>
}

/**
 * Options for the `let` form in the FlowBuilder DSL.
 *
 * This full form is LetOptionParams<V>, but shorthands are provided in the
 * forms of:
 * string - renames the parameter for journalling purposes
 * function/LetJournalFormatter - arbitrary reformatting of the resolved key/value pair
 * boolean - enable/disable private journalling for this parameter
 */
export type LetOptions<V> = LetOptionParams<V> | LetJournalOption<V> | boolean

export type LetForm<NS> = <T, LN extends string>(
  name: LN,
  value: LetValue<T, NS>,
  options?: LetOptions<T>
) => FlowBuilder<ExtendNS<NS, LN, Awaited<T>>>

export type DoForm<NS> = <T>(fn: (ns: NS) => T | Promise<T>) => FlowBuilder<NS>

export type DoEachForm<NS> = <T, K extends keyof NS>(
  symbol: K,
  fn: (value: IterValue<NS[K]>, ns: NS) => void | Promise<void | T | Promise<T>>
) => FlowBuilder<NS>

export interface FlowRunner {
  run(): Promise<any>
}

export interface FlowBuilder<NS> {
  /**
   * Define and collect a variable.
   *
   * @param name - The name of the variable.
   * @param value - The value of the variable, or a function that
   *                computes the value. May be async.
   * @param options - Additional options for the variable.
   * @param options.journal - Customize how the variable and its resolution
   *                          is recorded in the flow journal.
   * @param options.private - A flag or function to determine if the variable
   *                          should be marked as private in the flow journal.
   *
   * @returns The FlowBuilder instance for chaining.
   */
  let: LetForm<NS>
  do: DoForm<NS>
  /**
   * Define a loop over a collection in the flow context.
   *
   * Valid collections are `arrays` and `objects`. In the case of an array, iteration
   * will - predictably - be done over each element of the array. In the case of object,
   * iteration will be done over each `entry` - a tuple of key and value.
   *
   * @param symbol - The key in the flow context that holds the collection to iterate over.
   * @param fn - A function that is called for each item in the collection.
   */
  doEach: DoEachForm<NS>
  run: () => Promise<void>
}

export type FlowOperationType = 'do' | 'doEach' | 'let'

/**
 * Common interface for runnable operations in a Flow.
 */
export interface FlowForm {
  type: FlowOperationType
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
