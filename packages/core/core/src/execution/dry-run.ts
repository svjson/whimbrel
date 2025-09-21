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
    context.setMaterializationRun(true)
    context.setDryRun(true)
    context.useNullAppender()
    resetDryRun(ctx, plan.steps)

    const runner = makeRunner(ctx, plan)
    await runner.run()
  } finally {
    context.setMaterializationRun(false)
    context.restoreAppender()
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

const summarize = (ctx: WhimbrelContext, step: ExecutionStep) => {
  if (typeof step.inputs?.target?.path === 'string') {
    return step.inputs.target.path
  }
  return ''
}

const outputStepTree = (ctx: WhimbrelContext, steps: ExecutionStep[]) => {
  for (const step of steps) {
    ctx.log.info(` * ${step.id} - ${summarize(ctx, step)}`)
    ctx.log.indent()
    outputStepTree(ctx, step.steps)
    ctx.log.deindent()
  }
}
