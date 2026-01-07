import { Task, TaskId, TaskParameters } from '@src/task'
import { StepBinding } from '@src/execution'

/**
 * Describes the minimal information that must be provided about a step
 * while formulating a plan as a Blueprint.
 */
export interface ExecutionStepBlueprint {
  type: TaskId
  name?: string
  pinned?: boolean
  inputs?: any
  task?: Task
  parameters?: TaskParameters
  meta?: any
  bind?: StepBinding
  steps?: ExecutionStepBlueprint[]
}

/**
 * Describes a scaffolding Blueprint/outline of a Whimbrel plan.
 */
export interface Blueprint {
  steps: ExecutionStepBlueprint[]
}
