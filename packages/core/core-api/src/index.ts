export { WhimbrelError } from './core'
export {
  makeStepEvent,
  EVENT__STEP_EXECUTION_INITIATED,
  EVENT__STEP_EXECUTION_COMPLETED,
} from './event'
export { FacetImplementationError, makeFacetModule } from './facet'
export { toFileSystemReadOptions, toFileSystemWriteOptions } from './fs'
export { makeTask, moduleTasks, NoOpExecution } from './task'
export { Formatter, NullAppender, indent } from './log'
export { makeNullExecutionStep } from './execution'
export { defaultMutationHandler, ContextMutator } from './mutation'

export type { Actor } from './actor'
export type {
  EventType,
  StepEvent,
  StepEventType,
  VCSEventType,
  WhimbrelEvent,
} from './event'
export type { ExecutionStep, StepExecutionResult } from './execution'
export type {
  ExecuteTaskFunction,
  Task,
  TaskId,
  TaskParameter,
  TaskParameters,
  TaskPrototype,
} from './task'
export type {
  WhimbrelContext,
  WhimbrelCommandOptions,
  WhimbrelContextOptions,
} from './context'
export type {
  DeclaredFacet,
  DetectFunction,
  DetectedFacet,
  FacetDetectionResult,
  FacetDeclaration,
  FacetId,
  FacetModule,
  FacetRegistry,
  FacetScope,
  FacetScopes,
  FacetScopePrototype,
} from './facet'
export type {
  FileEntry,
  FileSystem,
  FileSystemMutation,
  FileSystemCtxOptions,
  FileSystemReadOptions,
  FileSystemRecurseOptions,
  FileSystemScanOptions,
  FileSystemFileOptions,
  FileSystemMkDirOptions,
  FileSystemWriteOptions,
  FsObjectType,
} from './fs'
export type { ApplicationLog } from './log'
export type { AcceptMutationHandler, Mutation, MutationType } from './mutation'
export type {
  Blueprint,
  ExecutionPlan,
  ExecutionStepBlueprint,
  TaskAugmentation,
  TaskAugmentations,
  StepAugmentation,
  StepAugmentationRules,
} from './plan'
