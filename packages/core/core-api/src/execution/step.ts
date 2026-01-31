import { StepAugmentation } from '@src/plan'
import { makeTask, Task, TaskId, TaskParameters } from '@src/task'
import { newStepResult, StepExecutionResult } from './result'
import { TreeState } from './tree'

/**
 * Describes a single step of an ExecutionPlan.
 */
export interface ExecutionStep {
  /**
   * The unique(within a branch of a step tree) identifier of the step.
   *
   * This will typically have the format of <actor>:<facet>:<task>.
   *
   * For example, `myproject:eslint:create` for a step that creates an
   * eslint configuration file in project described by Actor 'myproject'.
   */
  id: string

  /**
   * The StepIds of the direct parents of this step, if any.
   */
  parents: string[]

  /**
   * The human-readable name of the Step, as shown in the step tree output
   * of a plan.
   */
  name: string

  /**
   * The Task associated with this step.
   */
  task: Task

  /**
   * The input parameters of this step.
   */
  inputs: any

  /**
   * Declaration of expected and required parameters to be provided by
   * `inputs`.
   */
  parameters: TaskParameters

  /**
   * Bind-directives for this step, controlling the selection of source
   * and target actors or this step and its children.
   */
  bind: StepBinding

  /**
   * Meta-data collection for this step.
   */
  meta: {
    appliedAugmentations?: StepAugmentation[]
    [key: string]: any
  }

  /**
   * The expected result of this execution step. This is determined during
   * plan materialization.
   */
  expectedResult: StepExecutionResult

  /**
   * The "state" of this step in the execution tree. Typically determined
   * during plan materialization, and is used to signal if a step is satisfied
   * or redundant due to the purpose of the task associated with the step
   * already being fulfilled.
   */
  treeState: TreeState

  /**
   * The child steps and tasks of this step.
   */
  steps: ExecutionStep[]
}

/**
 * Meta-directive structure for this step, describing selection of source
 * and target actors.
 */
export interface StepBinding {
  source?: string
  target?: string
  key?: 'source' | 'target' | 'rootTarget'
}

/**
 * Constructs a "null-object" step.
 */
export const makeNullExecutionStep = (): ExecutionStep => {
  return {
    id: 'none',
    parents: [],
    name: 'None',
    task: makeTask({
      id: 'none',
    }),
    inputs: {},
    parameters: {},
    treeState: {
      state: 'default',
    },
    expectedResult: newStepResult(),
    bind: {},
    meta: {},
    steps: [],
  }
}
