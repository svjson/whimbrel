import Actor from '@whimbrel/actor'
import Source from '@whimbrel/source'
import GitIgnore from '@whimbrel/gitignore'

import { DefaultFacetRegistry } from '@whimbrel/facet'
import { FacetRegistry } from '@whimbrel/core-api'

/**
 * Build the standard FacetRegistry containg all stock Whimbrel facets.
 */
export const makeFacetRegistry = (): FacetRegistry => {
  return new DefaultFacetRegistry([Actor, Source, GitIgnore])
}
