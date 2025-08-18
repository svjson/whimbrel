import { performDryRun } from '@src/execution'
import { DryRunError, resetDryRun } from '@src/execution/dry-run'
import { mergeLeft } from '@whimbrel/walk'

import {
  ExecutionPlan,
  Blueprint,
  WhimbrelContext,
  ExecutionStep,
  ExecutionStepBlueprint,
  StepAugmentation,
  Task,
} from '@whimbrel/core-api'
import { PlanError } from './error'

interface MaterializationContext {
  complete: boolean
  lastError: DryRunError | null
  statusText: string
  iteration: number
}

export const generateExecutionStep = (
  ctx: WhimbrelContext,
  bpStep: ExecutionStepBlueprint | StepAugmentation
): ExecutionStep => {
  const task: Task = ctx.facets.lookupTask(bpStep.type)

  return {
    id: bpStep.type,
    name: bpStep.name ?? task.name,
    task: task,
    meta: bpStep.meta ?? {},
    inputs: mergeLeft({}, bpStep.inputs),
    parameters: task.parameters ?? {},
    treeState: {
      state: 'default',
    },
    steps: [],
  }
}

/**
 * Generate an initial tree of ExecutionStep nodes from the provided Blueprint.
 */
const generateInitialStepTree = (
  ctx: WhimbrelContext,
  blueprint: Blueprint
): ExecutionStep[] => {
  return blueprint.steps.map((bpStep) => generateExecutionStep(ctx, bpStep))
}

/**
 * Determine if the completed dry-run of `stepTree` has mutated the plan,
 * and thus needs to be re-evaluated.
 *
 * @param ctx - The context containing collaborators and options.
 * @param stepTree - The step tree to check for adjustments.
 * @return {boolean} - Returns true if the plan has been adjusted, false otherwise.
 */
const isPlanAdjusted = (_ctx: WhimbrelContext, _stepTree: ExecutionStep[]): boolean => {
  return false
}

/**
 * Generate an executable step tree from a step tree skeleton, allowing
 * facets to attach additional steps.
 *
 * This is a bit of a hybrid implementation that continously executes a
 * dry-run of the plan until it is stable.
 *
 * @param ctx - The context containing collaborators and options.
 * @param plan - The plan object containing the operation and initial steps.
 *
 * @returns A promise that resolves when the step tree is generated.
 *
 * @throws {WhimbrelError} If the operation generates invalid execution steps.
 * @throws {PlanError} If an unexpected error occurs while expanding a step.
 * @throws {DryRunError} If a dry run fails due to an error in the step execution.
 */
export const materializePlan = async (
  ctx: WhimbrelContext,
  blueprint: Blueprint
): Promise<ExecutionPlan> => {
  const stepTree: ExecutionStep[] = generateInitialStepTree(ctx, blueprint)

  const mCtx: MaterializationContext = {
    complete: false,
    lastError: null,
    statusText: 'Materializing plan..',
    iteration: 1,
  }

  const isLastError = (e: DryRunError) =>
    mCtx.lastError?.step.id === e.step.id && mCtx.lastError?.message === e.message

  ctx.log.showStatus(mCtx.statusText)

  while (!mCtx.complete) {
    ctx.log.updateStatus(mCtx.statusText + '.'.repeat(mCtx.iteration))

    await expandStepTree(ctx, stepTree)
    try {
      await performDryRun(ctx, { steps: stepTree })
    } catch (e) {
      ctx.log.hideStatus()
      if (e instanceof DryRunError) {
        if (isLastError(e)) {
          ctx.log.error(e.message)
          throw e.cause
        }
        mCtx.lastError = e
        ctx.log.showStatus()
        resetDryRun(ctx, stepTree)
        continue
      }
    }

    if (!isPlanAdjusted(ctx, stepTree)) {
      mCtx.complete = true
    }
    mCtx.lastError = null
  }

  ctx.log.hideStatus()

  return {
    steps: stepTree,
  }
}

/**
 * Expand an array of tree siblings by initializing each step and applying its
 * configuration.
 *
 * This function will recursively expand the step tree, initializing each step
 * and applying their individual configurations.
 *
 * @param ctx - The context containing collaborators and options.
 * @param stepTree - The array of steps to expand.
 * @param parent - The parent step of the stepTree
 *
 * @return {Promise<void>} A promise that resolves when all steps are expanded.
 */
const expandStepTree = async (
  ctx: WhimbrelContext,
  stepTree: ExecutionStep[],
  parent?: ExecutionStep
) => {
  for (const step of stepTree) {
    await expandStep(ctx, step, parent)
  }
}

/**
 * Expand a single step by initializing it, applying its configuration,
 * and applying any hooks or augmentations defined by activated facets.
 *
 * This function will also recursively expand any child steps defined
 * in the step's `steps` property.
 *
 * @param ctx - The context containing collaborators and options.
 * @param step - The step object to expand.
 * @param parent - The parent step of `step`, if any.
 *
 * @return {Promise<void>} A promise that resolves when the step is expanded.
 */
const expandStep = async (
  ctx: WhimbrelContext,
  step: ExecutionStep,
  parent?: ExecutionStep
): Promise<void> => {
  try {
    attachStepAugmentations(ctx, step)
    await expandStepTree(ctx, step.steps, step)
  } catch (e) {
    if (e instanceof PlanError) {
      throw e
    }
    throw new PlanError(
      `Error while materializing execution plan - Unexpected error while expanding step: ${step.name || step.task.id}`
    )
  }
}

/**
 * Allow any active facets to augment and attach child steps to `step`.
 */
const attachStepAugmentations = (ctx: WhimbrelContext, step: ExecutionStep) => {
  for (const facet of ctx.facets.all()) {
    const augmentationEntry = facet.taskAugmentations[step.task.id]
    if (!augmentationEntry) continue
    for (const augStep of augmentationEntry.steps) {
      step.steps.push(generateExecutionStep(ctx, augStep))
    }
  }
}
