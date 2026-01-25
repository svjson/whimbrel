import { actorFacetConfig, actorFacetScope, FacetQueryFunction } from '@whimbrel/core-api'

/**
 * Query-implementation of `project:package-manager` for pnpm.
 *
 * @param _ctx - The Whimbrel context.
 * @param _query - The FacetQuery containing the actor.
 *
 * @return PackageManager instance containing project pnpm version, if
 *         pnpm is the package manager for the current project
 */
export const queryPackageManager: FacetQueryFunction<'project:package-manager'> = async (
  _ctx,
  { actor }
) => {
  if (actorFacetScope(actor, 'pnpm')?.roles?.includes('pkg-manager')) {
    return {
      name: 'pnpm',
      version: actorFacetConfig(actor, 'pnpm')?.version,
    }
  }
}
