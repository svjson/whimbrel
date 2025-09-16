import { ActorType } from './actor'
import { WhimbrelContext } from './context'
import { FileSystemAccessMode } from './fs'

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
  fsMode: FileSystemAccessMode
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
export type RequirementType = 'actor' | 'string' | 'boolean'

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
  cli: {
    positional: boolean
    excludes: string[]
    sets: Record<string, any>
  }
  resolvers: TaskParameterResolver[]
  defaults: ValueProvider[]
}

export interface TaskParameterResolver {
  path: string
  type: ActorType
}

export interface TaskParameterDeclaration {
  type: RequirementType
  required?: boolean
  cli?: {
    positional?: boolean
    excludes?: string[]
    sets?: Record<string, any>
  }
  resolvers?: TaskParameterResolver[]
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
  fsMode?: FileSystemAccessMode
  bind?: {
    inheritSource?: boolean
    inheritTarget?: boolean
  }
  execute?: ExecuteTaskFunction
  dryExecute?: ExecuteTaskFunction
  parameters?: Record<string, TaskParameterDeclaration>
}

export const makeTaskParameter = (entry: TaskParameterDeclaration) => {
  return {
    ...entry,
    required: entry.required ?? false,
    cli: entry.cli
      ? {
          positional: entry.cli.positional ?? false,
          excludes: entry.cli.excludes ?? [],
          sets: entry.cli.sets ?? {},
        }
      : {
          positional: false,
          excludes: [],
          sets: {},
        },
    resolvers: entry.resolvers ?? [],
    defaults: entry.defaults ?? [],
  }
}

export const makeTaskParameters = (
  proto: Record<string, TaskParameterDeclaration> = {}
) => {
  return Object.entries(proto ?? {}).reduce((result, [name, entry]) => {
    result[name] = makeTaskParameter(entry)
    return result
  }, {} as TaskParameters)
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
    fsMode: proto.fsMode ?? '?',
    bind: {
      inheritSource: proto.bind?.inheritSource !== false,
      inheritTarget: proto.bind?.inheritTarget !== false,
    },
    execute: proto.execute ?? NoOpExecution,
    dryExecute: proto.dryExecute ?? proto.execute ?? NoOpExecution,
    parameters: makeTaskParameters(proto.parameters),
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
