import { Flow } from './dsl'

/**
 * Defines and appends a `do` form operation to `flow`.
 *
 * @param flow - The flow to which the `do` form will be added.
 * @param doFn - A function that performs side effects using the flow's namespace.
 *
 * @return void
 *
 * @template T - The return type of the `doFn` function.
 * @template NS - The type of the flow's namespace.
 */
export const defineDo = <T, NS>(flow: Flow, doFn: (ns: NS) => T | Promise<T>) => {
  flow.forms.push({
    type: 'do',
    run: async () => {
      return await doFn(flow.getNamespace<NS>())
    },
  })
}

/**
 * Defines and appends a `doEach` form operation to `flow`.
 *
 * @param flow - The flow to which the `doEach` form will be added.
 * @param symbol - The key in the flow's namespace that holds the iterable collection.
 * @param doFn - A function that is called for each item in the collection.
 *
 * @return void
 *
 * @template T - The return type of the `doFn` function.
 * @template V - The type of each item in the iterable collection.
 * @template NS - The type of the flow's namespace.
 * @template K - The key of the iterable collection in the namespace.
 */
export const defineDoEach = <T, V, NS, K extends keyof NS>(
  flow: Flow,
  symbol: K,
  doFn: (value: V, ns: NS) => Promise<void> | T | Promise<T>
) => {
  flow.forms.push({
    type: 'doEach',
    run: async () => {
      const ns: NS = flow.getNamespace<NS>()
      const iterable = ns[symbol]
      const values = Array.isArray(iterable) ? iterable : Object.entries(iterable)

      for (const value of values) {
        await doFn(value, ns)
      }
    },
  })
}
