import equal from 'fast-deep-equal'

import {
  FileSystemAccessMode,
  StepBinding,
  StepExecutionResult,
  TaskAugmentation,
} from '@whimbrel/core-api'
import { performDryRun } from '@src/execution'
import { DryRunError, resetDryRun } from '@src/execution/dry-run'
import { mergeLeft } from '@whimbrel/walk'
import { includesEqual } from '@whimbrel/array'

import {
  ExecutionPlan,
  Blueprint,
  WhimbrelContext,
  ExecutionStep,
  ExecutionStepBlueprint,
  StepAugmentation,
  Task,
  Actor,
  WhimbrelError,
  newStepResult,
} from '@whimbrel/core-api'
import { PlanError } from './error'

interface MaterializationContext {
  complete: boolean
  lastError: DryRunError | null
  statusText: string
  iteration: number
  cleanRuns: number
  lastExpectationTree: ExpectationNode[]
}

/**
 * Context-type for materialization runs, that tracks modifications to
 * the execution true being materialized during a single iteration
 */
interface IterationContext {
  sources: Record<string, Actor>
  targets: Record<string, Actor>

  /**
   * Number of new steps added during the most recent iteration.
   */
  newSteps: number

  /**
   * Total number of new steps added during the life-cycle of this context.
   */
  totalNewSteps: number

  /**
   * Number of tree expansion iterations performed during the life-cycle of this context.
   */
  expandIterations: number
}

interface ExpectationNode {
  id: string
  result: StepExecutionResult
  children: ExpectationNode[]
}

export const generateExecutionStep = (
  ctx: WhimbrelContext,
  bpStep: ExecutionStepBlueprint | StepAugmentation
): ExecutionStep => {
  const task: Task = bpStep.task ?? ctx.facets.lookupTask(bpStep.type)

  return {
    id: bpStep.type,
    parents: [],
    name: bpStep.name ?? task.name ?? task.id,
    task: task,
    bind: bpStep.bind ?? {},
    meta: bpStep.meta ?? {},
    inputs: mergeLeft({}, bpStep.inputs),
    parameters: task.parameters
      ? { ...task.parameters, ...(bpStep.parameters ?? {}) }
      : bpStep.parameters,
    expectedResult: newStepResult(),
    treeState: {
      state: 'default',
    },
    steps: bpStep.steps ? bpStep.steps.map((s) => generateExecutionStep(ctx, s)) : [],
  }
}

/**
 * Generate an initial tree of ExecutionStep nodes from the provided Blueprint.
 *
 * @param ctx - The context containing collaborators and options.
 * @param blueprint - The blueprint object containing the step definitions.
 *
 * @return An array of ExecutionStep nodes representing the initial step tree.
 */
const generateInitialStepTree = (
  ctx: WhimbrelContext,
  blueprint: Blueprint
): ExecutionStep[] => {
  return blueprint.steps.map((bpStep) => generateExecutionStep(ctx, bpStep))
}

/**
 * Determine if the completed dry-run of `stepTree` has mutated the plan
 * or generated different results, and thus needs to be re-evaluated.
 *
 * @param ctx - The context containing collaborators and options.
 * @param stepTree - The step tree to check for adjustments.
 * @return {boolean} - Returns true if the plan has been adjusted, false otherwise.
 */
const isPlanAdjusted = (
  _ctx: WhimbrelContext,
  mCtx: MaterializationContext,
  iCtx: IterationContext,
  stepTree: ExecutionStep[]
): boolean => {
  if (iCtx.totalNewSteps > 0 || mCtx.lastError) {
    mCtx.cleanRuns = 0
    return true
  }

  const expectationTree = buildExpectationTree(stepTree)

  if (equal(expectationTree, mCtx.lastExpectationTree)) {
    mCtx.cleanRuns++
  } else {
    mCtx.cleanRuns = 0
  }

  mCtx.lastExpectationTree = expectationTree

  return mCtx.cleanRuns < 2
}

const buildExpectationNode = (step: ExecutionStep): ExpectationNode => {
  return {
    id: step.id,
    result: step.expectedResult,
    children: buildExpectationTree(step.steps),
  }
}

const buildExpectationTree = (stepTree: ExecutionStep[]): ExpectationNode[] => {
  return stepTree.map((step) => buildExpectationNode(step))
}

/**
 * Create a context state object tracking iteration and materialization details.
 */
export const makeIterationContext = (ctx: WhimbrelContext): IterationContext => ({
  sources: ctx.sources,
  targets: ctx.targets,
  newSteps: 0,
  totalNewSteps: 0,
  expandIterations: 0,
})

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
  const { maxIterations } = ctx.materializationOptions
  const stepTree: ExecutionStep[] = generateInitialStepTree(ctx, blueprint)

  const mCtx: MaterializationContext = {
    complete: false,
    lastError: null,
    statusText: 'Materializing plan',
    iteration: 0,
    cleanRuns: 0,
    lastExpectationTree: [],
  }

  const isLastError = (e: DryRunError) =>
    mCtx.lastError?.step.id === e.step.id && mCtx.lastError?.message === e.message

  ctx.log.showStatus(mCtx.statusText)

  while (!mCtx.complete) {
    ctx.log.setIndentation(0)
    mCtx.iteration++
    if (mCtx.iteration > maxIterations) {
      throw new WhimbrelError('Plan Materialization Failed: Too many iterations.')
    }
    const iterCtx = makeIterationContext(ctx)

    ctx.log.updateStatus(mCtx.statusText + '.'.repeat(mCtx.iteration))

    do {
      if (iterCtx.expandIterations > 20) {
        throw new WhimbrelError(
          'Plan Materialization Failed: Too many tree expansion iterations.'
        )
      }
      iterCtx.newSteps = 0
      await expandStepTree(ctx, iterCtx, stepTree)
      iterCtx.totalNewSteps += iterCtx.newSteps
      iterCtx.expandIterations++
    } while (iterCtx.newSteps > 0)

    try {
      await performDryRun(ctx, { steps: stepTree, fsMode: determinePlanFsMode(stepTree) })
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
      throw e
    }

    if (!isPlanAdjusted(ctx, mCtx, iterCtx, stepTree)) {
      mCtx.complete = true
    }
    mCtx.lastError = null
  }

  ctx.log.hideStatus()

  return {
    steps: stepTree,
    fsMode: determinePlanFsMode(stepTree),
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
  iCtx: IterationContext,
  stepTree: ExecutionStep[],
  parent?: ExecutionStep
): Promise<void> => {
  for (const step of stepTree) {
    await expandStep(ctx, iCtx, step, parent)
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
  iterCtx: IterationContext,
  step: ExecutionStep,
  parent?: ExecutionStep
): Promise<void> => {
  try {
    prepareBinding(step, parent)
    assignId(step)
    assignParents(step, parent)
    await attachStepAugmentations(ctx, iterCtx, step)
    await expandStepTree(ctx, iterCtx, step.steps, step)
  } catch (e) {
    if (e instanceof PlanError) {
      throw e
    }
    throw new PlanError(
      `Error while materializing execution plan - Unexpected error while expanding step: ${step.name || step.task.id}`,
      e
    )
  }
}

const assignParents = (step: ExecutionStep, parent?: ExecutionStep) => {
  if (parent && parent.parents.length > 10) throw new WhimbrelError('Exceeded max depth')
  step.parents = parent ? [...parent.parents, parent.id] : []
}

const prepareBinding = (step: ExecutionStep, parent?: ExecutionStep) => {
  const inherited: StepBinding = {}
  if (parent?.bind?.source && step.task.bind.inheritSource)
    inherited.source = parent.bind.source
  if (parent?.bind?.target && step.task.bind.inheritTarget)
    inherited.target = parent.bind.target
  if (parent?.bind.key) {
    inherited.key = parent.bind.key
  }

  step.bind = mergeLeft({}, inherited, step.bind)
}

const assignId = (step: ExecutionStep) => {
  const parts = []
  const { bind } = step

  const { target, key } = bind
  if (key && bind[key]) {
    parts.push(bind[key])
  } else if (key) {
    const mutationPath = key === 'source' ? 'sources' : 'targets'
    const keyMutations = step.expectedResult.mutations.ctx
      .filter((p) => p.type === 'add' && p.path === mutationPath)
      .map((p) => p.key)

    const [actorId] = keyMutations

    if (actorId) {
      parts.push(actorId)
      bind[key] = actorId
    }
  } else if (target) {
    parts.push(target)
  }

  parts.push(step.task.id)

  step.id = parts.join(':')
}

/**
 * Allow any active facets to augment and attach child steps to `step`.
 */
const attachStepAugmentations = async (
  ctx: WhimbrelContext,
  iterCtx: IterationContext,
  step: ExecutionStep
) => {
  if (!step.meta.appliedAugmentations) step.meta.appliedAugmentations = []

  for (const facet of ctx.facets.all()) {
    const augmentationEntry: TaskAugmentation = facet.taskAugmentations[step.task.id]
    if (!augmentationEntry) continue

    if (augmentationEntry.condition) {
      if (!augmentationEntry.condition({ ctx, step })) {
        continue
      }
    }

    const stepAugmentations: StepAugmentation[] = []

    if (Array.isArray(augmentationEntry.steps)) {
      stepAugmentations.push(...augmentationEntry.steps)
    } else if (typeof augmentationEntry.steps === 'function') {
      stepAugmentations.push(...(await augmentationEntry.steps({ ctx, step })))
    }

    for (const augStep of stepAugmentations) {
      if (includesEqual(step.meta.appliedAugmentations, augStep)) {
        continue
      }
      step.meta.appliedAugmentations.push(augStep)
      iterCtx.newSteps++
      step.steps.push(generateExecutionStep(ctx, augStep))
    }
  }
}

export const determinePlanFsMode = (stepTree: ExecutionStep[]): FileSystemAccessMode => {
  const modes = []

  const collectModes = (steps: ExecutionStep[]) => {
    for (const child of steps) {
      if (!modes.includes(child.task.fsMode)) {
        modes.push(child.task.fsMode)
      }
      collectModes(child.steps)
    }
  }

  collectModes(stepTree)

  if (modes.includes('rw')) return 'rw'
  if (modes.includes('r') && modes.includes('w')) return 'rw'
  if (modes.includes('w')) return 'w'
  if (modes.includes('?')) return '?'
  if (modes.includes('r')) return 'r'
  return '-'
}
