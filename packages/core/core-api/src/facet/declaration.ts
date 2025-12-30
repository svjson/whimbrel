import { FacetScope, FacetScopePrototype } from './scope'

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
 * Describes a fully declared Facet with a specific scope/config
 * (used internally after processing FacetDeclaration entries).
 *
 * Includes the FacetId and the fully formed FacetScope.
 */
export interface DeclaredFacet<T = any> {
  facet: FacetId
  scope: FacetScope<T>
}
