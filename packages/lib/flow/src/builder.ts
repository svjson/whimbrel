import { WhimbrelContext } from '@whimbrel/core-api'

import { FlowBuilder, LetValue, LetOptions, ExtendNS, Flow } from './dsl'
import { defineLet } from './let'
import { defineDo, defineDoEach } from './do'
import { makeFlowRunner } from './runner'

/**
 * Begins a new flow builder.
 *
 * The statement is expected to end with a call to `.run()` to execute
 * the flow.
 *
 * @param ctx - The Whimbrel context.
 * @returns A FlowBuilder instance that provides a chainable API for
 *          defining a flow.
 */
export const beginFlow = (ctx: WhimbrelContext): FlowBuilder<{}> => {
  return makeFlowBuilder(ctx)
}

const makeFlowBuilder = <NS = {}>(ctx: WhimbrelContext) => {
  const flow: Flow = {
    ctx,
    break: false,
    scopes: [],
    forms: [],
    getNamespace<NS>() {
      return flow.scopes.at(-1)?.namespace ?? ({} as NS)
    },
  }

  const builder: FlowBuilder<NS> = {
    let: <T, LN extends string>(
      name: LN,
      value: LetValue<T, NS>,
      options?: LetOptions<T>
    ) => {
      defineLet(flow, name, value, options)
      return builder as FlowBuilder<ExtendNS<NS, LN, Awaited<T>>>
    },
    do: (fn) => {
      defineDo(flow, fn)
      return builder as FlowBuilder<NS>
    },
    doEach: (symbol, fn) => {
      defineDoEach(flow, symbol, fn)
      return builder as FlowBuilder<NS>
    },
    run: async (): Promise<any> => {
      const runner = makeFlowRunner(flow)
      return await runner.run()
    },
  }

  return builder
}
