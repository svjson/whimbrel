import { ContextOperator } from '@src/context'
import { ExecutionPlan, ExecutionStep, WhimbrelContext } from '@whimbrel/core-api'
import { makeRunner } from './runner'

/**
 * Reset the state of previous dry-run.
 */
export const resetDryRun = async (ctx: WhimbrelContext, stepTree: ExecutionStep[]) => {
  ctx.resetActors()
}

/**
 * Perform a dry-run of an ExecutionPlan.
 */
export const performDryRun = async (ctx: WhimbrelContext, plan: ExecutionPlan) => {
  const context = new ContextOperator(ctx)
  try {
    context.setDryRun(true)
    context.useNullAppender()
    context.useNewInMemoryFileSystem()
    resetDryRun(ctx, plan.steps)

    const runner = makeRunner(ctx, plan)
    await runner.run()
  } finally {
    context.setDryRun(false)
    context.restoreAppender()
    context.restoreFileSystem()
  }
}

/**
 * DryRunError is a specific error type used to indicate that an error
 * occurred during a dry-run execution of plan and has been correctly handled
 * and wrapped.
 */
export class DryRunError extends Error {
  constructor(
    message: string,
    public step: ExecutionStep,
    public cause: Error
  ) {
    super(message)
  }
}
