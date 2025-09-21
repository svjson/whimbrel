export { WhimbrelError, NoDryExecutionError } from './core'
export { makeActor } from './actor'
export { actorFacetConfig, actorFacetScope } from './actor'
export {
  makeStepEvent,
  makeVCSEvent,
  EVENT__STEP_EXECUTION_INITIATED,
  EVENT__STEP_EXECUTION_COMPLETED,
} from './event'
export { FacetImplementationError, makeFacetModule } from './facet'
export { toFileSystemReadOptions, toFileSystemWriteOptions } from './fs'
export {
  makeTask,
  makeTaskParameter,
  makeTaskParameters,
  moduleTasks,
  NoOpExecution,
} from './task'
export { Formatter, NullAppender, indent } from './log'
export { defaultMutationHandler, ContextMutator } from './mutation'
export {
  defaultJournalEntryHandler,
  makeNullExecutionStep,
  newStepResult,
} from './execution'

export type {
  Actor,
  ActorFilter,
  ActorId,
  ActorType,
  ActorMetaData,
  GetActorFunction,
} from './actor'
export type { CommandRunner, CtxCommandRunner, CtxCommandOutput } from './command'
export type {
  EventType,
  StepEvent,
  StepEventType,
  VCSEvent,
  VCSEventType,
  VCSEventDetails,
  WhimbrelEvent,
} from './event'
export type {
  AcceptJournalEntryHandler,
  JournalEntry,
  JournalEntryOrigin,
  ExecutionStep,
  StepBinding,
  StepExecutionResult,
  TreeState,
} from './execution'
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
  FacetQuery,
  FacetQueryFunction,
  FacetQueryResult,
  MergeConfigFunction,
} from './facet'
export type {
  FileEntry,
  FileSystem,
  FileSystemMutation,
  FileSystemCtxOptions,
  FileSystemAccessMode,
  FileSystemReadOptions,
  FileSystemRecurseOptions,
  FileSystemScanOptions,
  FileSystemFileOptions,
  FileSystemMkDirOptions,
  FileSystemWriteOptions,
  FsObjectType,
  LsOptions,
} from './fs'
export type { ApplicationLog, FileListOptions } from './log'
export type {
  AcceptMutationHandler,
  ContextMutation,
  Mutation,
  MutationType,
} from './mutation'
export type {
  Blueprint,
  ExecutionPlan,
  ExecutionStepBlueprint,
  TaskAugmentation,
  TaskAugmentations,
  StepAugmentation,
  StepAugmentationRules,
  StepAugmentationGenerator,
} from './plan'
export type { VCSMutation, VCSFileEntry, VCSMutationType } from './vcs'
