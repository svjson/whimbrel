import { WhimbrelContext } from '@whimbrel/core-api'

import { makeRunner } from '@src/execution'
import { makeAnalyzeScaffold } from '@src/operation'
import { materializePlan } from '@src/plan'

export const analyzePath = async (ctx: WhimbrelContext, dir: string) => {
  const blueprint = makeAnalyzeScaffold(dir)
  const plan = await materializePlan(ctx, blueprint)
  const runner = makeRunner(ctx, plan)
  await runner.run()
}
