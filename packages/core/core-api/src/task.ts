import { WhimbrelContext } from './context'

/**
 * Marker-type for task IDs.
 */
export type TaskId = string

/**
 * Function-interface for Task execution. Must be provided by a task
 * in order to be considered executable.
 */
export type ExecuteTaskFunction = (ctx: WhimbrelContext) => Promise<void>

/**
 * Interface for valid and fully materialized tasks.
 */
export interface Task {
  id: TaskId
  name: string
  bind: {
    inheritSource: boolean
    inheritTarget: boolean
  }
  execute: ExecuteTaskFunction
  dryExecute: ExecuteTaskFunction
  parameters: TaskParameters
}

/**
 * Enum-type for value types of TaskParameters.
 */
export type RequirementType = 'actor' | 'string'

/**
 * Describes a parameter as a reference to a value existing elsewhere.
 */
export interface ValueReference {
  ref: string
}

/**
 * Valid definitions of values for Task inputs.
 */
export type ValueProvider = ValueReference | string

/**
 * Structure for declaration of a task parameter.
 */
export interface TaskParameter {
  type: RequirementType
  required: boolean
  defaults: ValueProvider[]
}

export interface TaskParameterDeclaration {
  type: RequirementType
  required?: boolean
  defaults?: ValueProvider[]
}

/**
 * Structure for declaration of valid input parameters for a Task.
 */
export type TaskParameters = Record<string, TaskParameter>

/**
 * Stock no-op execution function used for non-executable tasks.
 */
export const NoOpExecution = (_ctx: WhimbrelContext) => null

/**
 * Interface for describing a Task, allowing for omission of
 * properties that may use default values.
 */
export interface TaskPrototype {
  id: TaskId
  name?: string
  bind?: {
    inheritSource?: boolean
    inheritTarget?: boolean
  }
  execute?: ExecuteTaskFunction
  dryExecute?: ExecuteTaskFunction
  parameters?: Record<string, TaskParameterDeclaration>
}

/**
 * Construct a valid and fully formed Task instance from a
 * TaskPrototype, providing default values for properties not
 * described by the prototype.
 */
export const makeTask = (proto: TaskPrototype): Task => {
  return {
    id: proto.id,
    name: proto.name,
    bind: {
      inheritSource: proto.bind?.inheritSource !== false,
      inheritTarget: proto.bind?.inheritSource !== false,
    },
    execute: proto.execute ?? NoOpExecution,
    dryExecute: proto.dryExecute ?? proto.execute ?? NoOpExecution,
    parameters: Object.entries(proto.parameters ?? {}).reduce((result, [name, entry]) => {
      result[name] = {
        ...entry,
        required: entry.required ?? false,
        defaults: entry.defaults ?? [],
      }
      return result
    }, {} as TaskParameters),
  }
}

/**
 * Transform any number of Task instances to a map of TaskId->Task
 */
export const moduleTasks = (...tasks: Task[]): Record<TaskId, Task> => {
  return tasks.reduce((result, task) => {
    result[task.id] = task
    return result
  }, {})
}
