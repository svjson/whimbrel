import { FacetId } from './declaration'
import { FacetRoles } from './role'

/**
 * Allows describing the scope/configuration of a facet without
 * providing all properties.
 *
 * Properties that are omitted will take suitable default values
 * (empty arrays, objects, etc) when processed into a full FacetScope.
 */
export interface FacetScopePrototype<CFG = any> {
  /**
   * Roles assigned to the facet instance within the context of an
   * actor.
   */
  roles?: FacetRoles
  /**
   * Configuration properties specific to the facet type and context.
   */
  config?: CFG
  /**
   *
   */
  resolution?: string
}

/**
 * Describes the scope/configuration of a facet instance.
 * Includes roles assigned to the facet and configuration
 * properties specific to the facet type.
 */
export interface FacetScope<CFG = any> {
  /**
   * Roles assigned to the facet instance within the context of an
   * actor.
   */
  roles: FacetRoles
  /**
   * Configuration properties specific to the facet type and context.
   */
  config: CFG
  /**
   *
   */
  resolution?: string
}

/**
 * Mapping of Facet IDs to their corresponding FacetScopes.
 * Used to represent the scopes of multiple facets.
 * Each key is a FacetId and the value is the associated FacetScope.
 */
export type FacetScopes = Record<FacetId, FacetScope>
