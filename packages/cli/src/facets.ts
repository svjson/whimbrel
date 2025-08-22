import Actor from '@whimbrel/actor'
import Source from '@whimbrel/source'
import GitIgnore from '@whimbrel/gitignore'
import PackageJson from '@whimbrel/package-json'
import Project from '@whimbrel/project'
import Target from '@whimbrel/target'
import Npm from '@whimbrel/npm'
import Node from '@whimbrel/node'
import TsConfigJson from '@whimbrel/tsconfig-json'
import Turbo from '@whimbrel/turborepo'

import { DefaultFacetRegistry } from '@whimbrel/facet'
import { FacetRegistry } from '@whimbrel/core-api'

/**
 * Build the standard FacetRegistry containg all stock Whimbrel facets.
 */
export const makeFacetRegistry = (): FacetRegistry => {
  return new DefaultFacetRegistry([
    Actor,
    GitIgnore,
    Node,
    Npm,
    PackageJson,
    Project,
    Source,
    Target,
    TsConfigJson,
    Turbo,
  ])
}
