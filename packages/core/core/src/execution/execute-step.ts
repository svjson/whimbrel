import {
  newStepResult,
  WhimbrelContext,
  ContextMutator,
  ExecutionStep,
  ExecuteTaskFunction,
  WhimbrelError,
} from '@whimbrel/core-api'
import { NodeExecutionResult } from './execution-tree'
import { ensureStepParameters } from './step-parameters'

/**
 * Abstract base-class for execution a single step of a Whimbrel-plan.
 */
abstract class StepRunner {
  constructor(
    protected ctx: WhimbrelContext,
    protected step: ExecutionStep
  ) {}

  /**
   * Prepare the step or execution, but assigning it to the context and
   * creating a fresh step result.
   *
   * Attempts to ensure and resolve parameters required by the task.
   */
  prepareExecution() {
    this.ctx.step = this.step
    this.ctx.stepResult = newStepResult()
    ensureStepParameters(this.ctx, this.step)
  }

  /**
   * Apply the meta-directive of the step, switching the current source
   * and target of the context.
   */
  applyBindings() {
    const context = new ContextMutator(this.ctx)
    if (this.step.bind) {
      const { source, target } = this.step.bind

      if (source && this.ctx.sources[source]) {
        context.setSource(source)
      }
      if (target && this.ctx.targets[target]) {
        context.setTarget(target)
      }
    }
  }

  /**
   * Execute the task associated with the wrapped step.
   */
  async executeTask() {
    const executeFunction = this.getTaskExecutable()
    await executeFunction(this.ctx)
  }

  abstract runPostExecutionActions(): Promise<void>

  /**
   * Get the executable function of the task associated with this step.
   */
  abstract getTaskExecutable(): ExecuteTaskFunction
}

/**
 * StepRunner-implementation for Dry-Run executions.
 */
class DryStepRunner extends StepRunner {
  constructor(ctx: WhimbrelContext, step: ExecutionStep) {
    super(ctx, step)
  }

  /**
   * Provide the runner with the dry-run specific execute-function
   * of the task associated with this step.
   */
  getTaskExecutable(): ExecuteTaskFunction {
    return this.step.task.dryExecute
  }

  /**
   * Capture the step execution result as the expected output of this
   * this step.
   */
  async runPostExecutionActions(): Promise<void> {
    this.step.expectedResult = this.ctx.stepResult
    for (const param of this.step.meta.resolvedParameters ?? []) {
      delete this.step.inputs[param]
    }
  }
}

/**
 * StepRunner-implementation for live runs
 */
class LiveStepRunner extends StepRunner {
  constructor(ctx: WhimbrelContext, step: ExecutionStep) {
    super(ctx, step)
  }

  /**
   * Provide the runner with the sharp-loaded execute-unction of the task
   * associated with this step.
   */
  getTaskExecutable(): ExecuteTaskFunction {
    return this.step.task.execute
  }

  async runPostExecutionActions(): Promise<void> {}
}

/**
 * Factory-function for creating a StepRunner instance.
 */
const makeStepRunner = (ctx: WhimbrelContext, step: ExecutionStep): StepRunner => {
  if (ctx.dryRun) {
    return new DryStepRunner(ctx, step)
  } else {
    return new LiveStepRunner(ctx, step)
  }
}

/**
 * Execute a step, by choosing the appropriate runner and reporting task
 * execution status.
 */
export const executeStep = async (
  ctx: WhimbrelContext,
  step: ExecutionStep
): Promise<NodeExecutionResult> => {
  const stepRunner = makeStepRunner(ctx, step)
  try {
    stepRunner.applyBindings()
    stepRunner.prepareExecution()
    await stepRunner.executeTask()
    await stepRunner.runPostExecutionActions()
    return { success: true }
  } catch (e) {
    if (!(e instanceof WhimbrelError)) {
      ctx.log.error(e)
    }

    return {
      success: false,
      message: `${e}`,
      error: e,
    }
  } finally {
  }
}
