import { FacetId, FacetScope } from './facet'

/**
 * Enum-type for types of Actor that may occur in a WhimbrelContext.
 */
export type ActorType = 'target' | 'source' | 'rootTarget'

/**
 * Structure of the Actor metadata object.
 */
export interface ActorMetaData {}

/**
 * Filter used for searching for actors
 */
export interface ActorFilter {
  root?: string
}

/**
 * Function signature for retrieving a single actor from a container of
 * actors, e.g, WhimbrelContext
 */
export type GetActorFunction = (
  type: ActorType,
  actorId: ActorId | ActorFilter
) => Actor | undefined

/**
 * Marker type for Actor IDs
 */
export type ActorId = string

/**
 * Describes an Actor of a WhimbrelContext - the main objects read from
 * or operated on, e.g, a project in the file system.
 */
export interface Actor {
  id: ActorId
  name: string
  root: string
  facets: Record<FacetId, FacetScope>
  meta: ActorMetaData
  subModules: ActorId[]
}

/**
 * Describes an Actor of a WhimbrelContext - the main objects read from
 * or operated on, e.g, a project in the file system.
 */
export interface MakeActorParams {
  id: ActorId
  name?: string
  root: string
  facets?: Record<FacetId, FacetScope>
  meta?: ActorMetaData
  subModules?: ActorId[]
}

/**
 * Convenience factory-function for Actor.
 */
export const makeActor = (params: MakeActorParams): Actor => {
  return {
    id: params.id,
    name: params.name ?? params.id,
    root: params.root,
    facets: { ...(params.facets ?? {}) },
    meta: params.meta ?? params.meta,
    subModules: params.subModules ?? [],
  }
}

export const actorFacetScope = (
  actor: Actor,
  facetId: FacetId
): FacetScope | undefined => {
  return actor.facets[facetId]
}

export const actorFacetConfig = <T = any>(
  actor: Actor,
  facetId: FacetId
): T | undefined => {
  return actorFacetScope(actor, facetId)?.config
}
