import {
  ExecutionStep,
  newStepResult,
  StepBinding,
  StepExecutionResult,
  Task,
  TaskParameters,
  TreeState,
} from '@whimbrel/core-api'

export interface StepDefinition {
  task: Task

  id?: string
  bind?: StepBinding
  name?: string
  parents?: string[]
  expectedResult?: StepExecutionResult
  inputs?: any
  meta?: any
  treeState?: TreeState
  parameters?: TaskParameters
  steps?: ExecutionStep[]
}

export const makeConcreteStep = (stepDef: StepDefinition): ExecutionStep => {
  return {
    id: stepDef.id ?? stepDef.task.id,
    name: stepDef.name ?? stepDef.task.name,
    bind: stepDef.bind ?? {},
    parents: stepDef.parents ?? [],
    expectedResult: stepDef.expectedResult ?? newStepResult(),
    inputs: stepDef.inputs ?? {},
    meta: stepDef.meta ?? {},
    treeState: stepDef.treeState ?? { state: 'default' },
    parameters: stepDef.parameters ?? stepDef.task.parameters,
    steps: stepDef.steps ?? [],
    task: stepDef.task,
  }
}
