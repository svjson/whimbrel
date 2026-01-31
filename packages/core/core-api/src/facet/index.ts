export { FacetImplementationError } from './error'
export { makeFacetModule } from './factory'

export type { Artifact } from './artifact'
export type { MergeConfigFunction } from './config'
export type { DeclaredFacet, FacetDeclaration, FacetId } from './declaration'
export type {
  DetectFunction,
  DetectedFacet,
  FacetDetectionResult,
  NoDetectFunction,
  NoFacetDetected,
} from './detect'
export type { FacetModule, FacetModulePrototype } from './module'
export type {
  FacetQuery,
  FacetQueryFunction,
  FacetQueryResult,
  InferQueryCriteriaType,
  InferQueryResultType,
  QueryIndex,
} from './query'
export type { FacetRegistry } from './registry'
export type { FacetScope, FacetScopes, FacetScopePrototype } from './scope'

export type {
  BuildConfigRole,
  BuiltInFunCallResolution,
  ConcreteValueResolution,
  ConfigProviderRole,
  EngineRole,
  EnvValueResolution,
  ExplainScriptCriteria,
  FacetRole,
  FacetRoles,
  HttpAdapterRole,
  HttpPortResolution,
  IgnoreFileRole,
  LicenseRole,
  PackageFileRole,
  PackageManager,
  PackageManagerRole,
  ProcessArgValueResolution,
  ScriptExplanation,
  ValueResolution,
  VersionControlRole,
} from './role'
