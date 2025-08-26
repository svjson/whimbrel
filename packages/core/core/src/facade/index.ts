import { makeRunner } from '@src/execution'
import { makeAnalyzeScaffold } from '@src/operation'
import { materializePlan } from '@src/plan'
import { WhimbrelContext } from '@whimbrel/core-api'

export const analyzePath = async (ctx: WhimbrelContext, dir: string) => {
  const blueprint = makeAnalyzeScaffold(dir)
  const plan = await materializePlan(ctx, blueprint)
  const runner = makeRunner(ctx, plan)
  await runner.run()
}
