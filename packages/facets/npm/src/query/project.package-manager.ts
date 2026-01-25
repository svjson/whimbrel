import { actorFacetConfig, actorFacetScope, FacetQueryFunction } from '@whimbrel/core-api'

/**
 * Query-implementation of `project:package-manager` for npm.
 *
 * @param _ctx - The Whimbrel context.
 * @param _query - The FacetQuery containing the actor.
 *
 * @return PackageManager instance containing project npm version, if
 *         npm is the package manager for the current project
 */
export const queryPackageManager: FacetQueryFunction<'project:package-manager'> = async (
  _ctx,
  { actor }
) => {
  if (actorFacetScope(actor, 'npm')?.roles?.includes('pkg-manager')) {
    return {
      name: 'npm',
      version: actorFacetConfig(actor, 'npm')?.version,
    }
  }
}
