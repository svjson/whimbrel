export { FacetImplementationError } from './error'
export { makeFacetModule } from './factory'

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
  ConfigProviderRole,
  EngineRole,
  ExplainScriptCriteria,
  FacetRole,
  FacetRoles,
  HttpAdapterRole,
  IgnoreFileRole,
  LicenseRole,
  PackageFileRole,
  PackageManagerRole,
  ScriptExplanation,
  VersionControlRole,
} from './role'
