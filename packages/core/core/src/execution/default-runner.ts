import {
  EVENT__STEP_EXECUTION_COMPLETED,
  EVENT__STEP_EXECUTION_INITIATED,
  ExecutionPlan,
  makeStepEvent,
  WhimbrelContext,
} from '@whimbrel/core-api'
import { buildExecTree, ExecutionNode, TreeExecutionResult } from './execution-tree'
import { matchesStepIdSelector } from './step'
import { ContextOperator } from '@src/context'
import { DryRunError } from './dry-run'

/**
 * Abstract base class for Whimbrel Plan Runners.
 */
export abstract class Runner {
  constructor(
    protected ctx: WhimbrelContext,
    protected plan: ExecutionPlan
  ) {}

  /**
   * Run the wrapped Execution-plan.
   */
  abstract run(): Promise<TreeExecutionResult>
}

/**
 * The Default Runner-implementation for running Whimbrel Plans.
 */
export class DefaultRunner extends Runner {
  constructor(ctx: WhimbrelContext, plan: ExecutionPlan) {
    super(ctx, plan)
  }

  /**
   * Test if the context is requesting execution to halt at the current node.
   *
   * This is used to implement the `--halt-at` option, which allows execution to
   * stop at a specific step in the plan.
   *
   * Will never test true during dry runs.
   *
   * @param node - The current execution node.
   * @return true if the execution should halt at this node, false otherwise.
   */
  private isHaltState(node: ExecutionNode): boolean {
    if (this.ctx.dryRun) return false
    return (
      this.ctx.options.haltAt && matchesStepIdSelector(this.ctx.options.haltAt, node.id)
    )
  }

  /**
   * Execute every sibling node of a level in the ExecutionPlan StepTree.
   *
   * This is the main execution loop of the Runner, which iterates over
   * the nodes in the execution tree, executing each node's step and
   * recursively executing its children.
   *
   * EVENT__STEP_EXECUTION_INITIATED and EVENT__STEP_EXECUTION_COMPLETED
   * events are emitted for each step execution, allowing other components
   * - including facet agents - to hook into the execution life cycle.
   *
   * If a node is in a halt state, the execution will stop and return
   * an object indicating that the execution was halted, along with
   * the ID of the step where execution was halted.
   *
   * If execution completes without halting, the result will be an empty
   * object.
   *
   * @param execTree - The execution tree to execute, as an array of
   *                   ExecutionNode.
   * @return A Promise that resolves to a TreeExecutionResult object
   */
  private async executeTree(execTree: ExecutionNode[]): Promise<TreeExecutionResult> {
    for (const node of execTree) {
      if (this.isHaltState(node)) {
        return {
          halt: true,
          stepId: node.id,
        }
      }
      this.ctx.log.info(`* ${this.ctx.formatter.formatStepTitle(node.step)}`)
      this.ctx.emitEvent(makeStepEvent(EVENT__STEP_EXECUTION_INITIATED, node.step))
      const nodeResult = await node.run()

      const formattedStepResult = this.ctx.formatter.formatStepResult(this.ctx.stepResult)
      this.ctx.log.indent()
      if (formattedStepResult) {
        this.ctx.log.info(formattedStepResult)
      }
      this.ctx.log.deindent()

      if (nodeResult.success === false) {
        if (this.ctx.materializationRun) {
          throw new DryRunError(nodeResult.error.message, node.step, nodeResult.error)
        }
        throw nodeResult.error
      }
      this.ctx.log.indent()

      const result = await this.executeTree(node.children)
      if (result.halt) {
        return result
      }

      this.ctx.emitEvent(makeStepEvent(EVENT__STEP_EXECUTION_COMPLETED, node.step))
      this.ctx.log.deindent()
    }
    return {}
  }

  /**
   * Run the wrapped Execution-plan.
   */
  async run(): Promise<TreeExecutionResult> {
    const context = new ContextOperator(this.ctx)
    try {
      this.ctx.resetActors()

      if (this.ctx.dryRun || this.ctx.options.dryRun) {
        context.setDryRun(true)
        if (this.plan.fsMode !== 'r') {
          context.useNewInMemoryFileSystem()
        }
      }

      const execTree = buildExecTree(this.ctx, this.plan)
      return await this.executeTree(execTree)
    } finally {
      if (this.ctx.materializationRun) {
        context.restoreFileSystem()
      }
      context.setDryRun(false)
    }
  }
}
