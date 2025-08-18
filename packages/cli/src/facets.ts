import actor from '@whimbrel/actor'
import source from '@whimbrel/source'

import { DefaultFacetRegistry } from '@whimbrel/facet'
import { FacetRegistry } from '@whimbrel/core-api'

/**
 * Build the standard FacetRegistry containg all stock Whimbrel facets.
 */
export const makeFacetRegistry = (): FacetRegistry => {
  return new DefaultFacetRegistry([actor, source])
}
