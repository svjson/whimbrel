import { WhimbrelContext } from '@whimbrel/core-api'

import { FlowBuilder, LetValue, LetOptions, ExtendNS, Flow } from './dsl'
import { defineLet } from './let'
import { defineDo } from './do'
import { makeFlowRunner } from './runner'

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
      options?: LetOptions
    ) => {
      defineLet(flow, name, value, options)
      return builder as FlowBuilder<ExtendNS<NS, LN, Awaited<T>>>
    },
    do: <T>(fn: (ns: NS) => T | Promise<T>) => {
      defineDo(flow, fn)
      return builder as FlowBuilder<NS>
    },
    run: async (): Promise<any> => {
      const runner = makeFlowRunner(flow)
      return await runner.run()
    },
  }

  return builder
}
