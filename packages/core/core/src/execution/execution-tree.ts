import { ExecutionPlan, ExecutionStep, WhimbrelContext } from '@whimbrel/core-api'
import { executeStep } from './execute-step'

/**
 * Structure describing a successful execution of a single node of a
 * three of ExecutionNodes
 */
export interface SuccessfulNodeExecution {
  success: true
}

/**
 * Structure describing a failed execution of a single node of a
 * tree of ExecutionNodes.
 */
export interface FailedNodeExecution {
  success: false
  message: string
  error: Error
}

/**
 * Execution result of a single node of a tree of ExecutionNodes
 */
export type NodeExecutionResult = SuccessfulNodeExecution | FailedNodeExecution

/**
 * Structure describing the result of the full execution of a tree of
 * ExecutionNodes
 */
export interface TreeExecutionResult {
  halt?: boolean
  stepId?: string
}

/**
 * Structure describing a node of an execution tree. This encapsulation
 * ensures that nodes can be executed by runners with varying levels of
 * control over the execution flow. (Looking at you, listr2).
 */
export interface ExecutionNode {
  id: string
  title: string
  step: ExecutionStep
  indent: number
  children: ExecutionNode[]
  run: () => Promise<NodeExecutionResult>
}

/**
 * Construct and ExecutionNode from an ExecutionStep.
 *
 * @param ctx - The WhimbrelContext.
 * @param step - The step to wrap.
 * @param indendation - The indentation-level, or depth, of the node in the
 * tree. Required by runners whose execution flow is not implemented by Whimbrel
 * itself.
 */
const buildExecTreeNode = (
  ctx: WhimbrelContext,
  step: ExecutionStep,
  indentation = 0
): ExecutionNode => {
  return {
    id: step.id,
    title: step.name,
    step: step,
    indent: indentation,
    children: step.steps.map((cs) => buildExecTreeNode(ctx, cs, indentation + 1)),
    run: async () => {
      return await executeStep(ctx, step)
    },
  }
}

/**
 * Construct a tree of ExecutionNodes from an ExecutionPlan.
 */
export const buildExecTree = (ctx: WhimbrelContext, plan: ExecutionPlan) => {
  return plan.steps.map((step) => buildExecTreeNode(ctx, step))
}
