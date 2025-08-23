import { Actor } from './actor'
import { WhimbrelContext } from './context'
import { WhimbrelError } from './core'
import { TaskAugmentations } from './plan'
import { Task, TaskId } from './task'

/**
 * Marker-type for Facet IDs.
 */
export type FacetId = string

/**
 * Describes valid formats in which to declare/configure the inclusion
 * of a facet.
 *
 * Can either be a raw FacetId(no configuration) or FacetDeclarationEntry,
 * providing detailed configuration for the facet.
 */
export type FacetDeclaration = FacetId | FacetDeclarationEntry

/**
 * Describes a Facet with a detailed scope/config
 */
export interface FacetDeclarationEntry {
  facet: FacetId
  scope?: FacetScopePrototype
}

/**
 *
 */
export interface DeclaredFacet<T = any> {
  facet: FacetId
  scope: FacetScope<T>
}

export interface FacetQuery {
  type: string
  actor?: Actor
  subModules?: boolean
}

export interface FacetQueryResult {
  source: FacetId
  result: any
}

export type FacetQueryFunction = (ctx: WhimbrelContext, query: FacetQuery) => Promise<any>

export type QueryIndex = Record<string, FacetQueryFunction>

/**
 * Allows describing a Facet without providing properties for which there
 * are suitable default values (empty arrays or objects, etc).
 */
export interface FacetModulePrototype {
  id: FacetId
  tasks?: Record<TaskId, Task>
  queryIndex?: QueryIndex
  taskAugmentations?: TaskAugmentations
  implicits?: FacetDeclaration[]
  detect?: DetectFunction
}

/**
 * Describes a fully formed FacetModule
 */
export interface FacetModule {
  id: FacetId
  tasks: Record<TaskId, Task>
  queryIndex: any
  taskAugmentations: TaskAugmentations
  implicits: FacetDeclaration[]
  detect?: DetectFunction
  getTask(taskName: string): Task
}

export const NoDetectFunction = async (_ctx: WhimbrelContext, _dir: string) => ({
  detected: false,
})

/**
 * Construct a FacetModule instance from a FacetModulePrototype.
 */
export const makeFacetModule = (module: FacetModulePrototype) => {
  const facetModule = {
    id: module.id,
    tasks: module.tasks ?? {},
    queryIndex: module.queryIndex ?? {},
    taskAugmentations: module.taskAugmentations ?? {},
    implicits: module.implicits ?? [],
    detect: module.detect ?? NoDetectFunction,
    getTask(taskName: string): Task {
      const nameParts = taskName.split(':')
      const taskId = nameParts.length == 2 ? taskName : `${facetModule.id}:${taskName}`

      const task = facetModule.tasks[taskId]
      if (!task) {
        throw new WhimbrelError(
          `Facet '${facetModule.id}' does not provide task '${taskId}'.`
        )
      }
      return task
    },
  }

  return facetModule
}

export interface FacetRegistry {
  register(facet: FacetModule): void
  get(facetId: FacetId): FacetModule | undefined
  all(): FacetModule[]
  lookupTask(taskId: string): Task
}

/**
 * Structure used by facet implementations to communicate detection result.
 *
 * This is the return type of `DetectFunction`.
 */
export type DetectedFacet = {
  detected: true
  facet?: {
    scope: FacetScopePrototype
  }
  advice?: {
    facets?: FacetDeclaration[]
  }
}

export type NoFacetDetected = {
  detected: false
}

export type FacetDetectionResult = DetectedFacet | NoFacetDetected

export type DetectFunction = (
  ctx: WhimbrelContext,
  dir: string
) => Promise<FacetDetectionResult>

export type FacetRoles = string[]

export interface FacetScopePrototype<CFG = any> {
  roles?: FacetRoles
  config?: CFG
  resolution?: string
}

export interface FacetScope<CFG = any> {
  roles: FacetRoles
  config: CFG
  resolution?: string
}

export type FacetScopes = Record<FacetId, FacetScope>

export class FacetImplementationError extends WhimbrelError {
  constructor(
    message: string,
    public facetId: FacetId,
    public details: any
  ) {
    super(message)
  }
}
