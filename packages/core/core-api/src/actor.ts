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
 * Describes an Actor of a WhimbrelContext - the main objects read from
 * or operated on, e.g, a project in the file system.
 */
export interface Actor {
  name: string
  root: string
  facets: Record<FacetId, FacetScope>
  meta: ActorMetaData
}
