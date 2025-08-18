import { ExecutionPlan, WhimbrelContext } from '@whimbrel/core-api'
import { Runner, DefaultRunner } from './default-runner'

/**
 * Construct a Runner instance according the context options.
 */
export const makeRunner = (ctx: WhimbrelContext, plan: ExecutionPlan): Runner => {
  return new DefaultRunner(ctx, plan)
}
