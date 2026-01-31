export { WhimbrelError, NoDryExecutionError } from './core'
export { makeActor } from './actor'
export { actorFacetConfig, actorFacetScope } from './actor'
export {
  makeStepEvent,
  makeVCSEvent,
  EVENT__STEP_EXECUTION_INITIATED,
  EVENT__STEP_EXECUTION_COMPLETED,
} from './event'
export { resolveStepActorRole } from './plan'
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
  stepResultEqual,
} from './execution'

export type {
  Actor,
  ActorFilter,
  ActorId,
  ActorRole,
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
  RequirementType,
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
  Artifact,
  BuiltInFunCallResolution,
  PackageFileRole,
  PackageManager,
  PackageManagerRole,
  BuildConfigRole,
  ConcreteValueResolution,
  ConfigProviderRole,
  EnvValueResolution,
  VersionControlRole,
  EngineRole,
  ExplainScriptCriteria,
  HttpAdapterRole,
  HttpPortResolution,
  IgnoreFileRole,
  InferQueryResultType,
  InferQueryCriteriaType,
  LicenseRole,
  FacetRole,
  FacetRoles,
  DeclaredFacet,
  DetectFunction,
  DetectedFacet,
  FacetDetectionResult,
  FacetDeclaration,
  FacetId,
  FacetModule,
  FacetModulePrototype,
  FacetRegistry,
  FacetScope,
  FacetScopes,
  FacetScopePrototype,
  FacetQuery,
  FacetQueryFunction,
  FacetQueryResult,
  ProcessArgValueResolution,
  MergeConfigFunction,
  QueryIndex,
  ScriptExplanation,
  ValueResolution,
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
export type {
  FreeFunctionInvocationDescription,
  FunctionIdentificationCriteria,
  FunctionInvocationDescription,
  FunctionLookupDescription,
  ImportSourceDescription,
  InstanceDescription,
  InvocationArgumentResolution,
  InvocationExpression,
  MemberFunctionInvocationDescription,
  PositionalArgumentDescription,
  ProjectSourceFolders,
  ReturnValueLookupDescription,
  ObjectPathDescription,
  SourceFileReference,
  SourceFolder,
  SourceLookupDescription,
  SourceLookupConditionalOr,
  SourceTreeReference,
} from './lang'
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
export type { ScriptDescription, ScriptIntent } from './script'
export type { VCSIgnoreFile, VCSMutation, VCSFileEntry, VCSMutationType } from './vcs'
