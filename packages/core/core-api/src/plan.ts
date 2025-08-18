import { ExecutionStep, StepMeta } from './execution'
import { TaskId, TaskParameters } from './task'

/**
 * Describes the minimal information that must be provided about a step
 * to formulate a plan as a Blueprint.
 */
export interface ExecutionStepBlueprint {
  type: TaskId
  name?: string
  pinned?: boolean
  inputs?: any
  parameters?: TaskParameters
  meta?: StepMeta
  steps?: ExecutionStepBlueprint[]
}

/**
 * Describes a scaffolding Blueprint/outline of a Whimbrel plan.
 */
export interface Blueprint {
  steps: ExecutionStepBlueprint[]
}

/**
 * Describes a concrete Whimbrel plan.
 */
export interface ExecutionPlan {
  steps: ExecutionStep[]
}

/**
 * Describes the rules under which step augmentation may occur.
 */
export interface StepAugmentationRules {}

/**
 * Describes the a step with which to augment another step, in arbitrary
 * detail.
 */
export type StepAugmentation = ExecutionStepBlueprint & StepAugmentationRules

/**
 * Describes the augmentations available for a Task.
 */
export interface TaskAugmentation {
  steps: StepAugmentation[]
}

/**
 * Describes the Task augmentation configuration of a facet.
 */
export type TaskAugmentations = Record<string, TaskAugmentation>
