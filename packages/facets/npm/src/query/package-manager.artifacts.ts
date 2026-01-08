import { FacetQueryFunction } from '@whimbrel/core-api'

/**
 * Query-implementation of `package-manager:artifacts` for npm.
 *
 * @param _ctx - The Whimbrel context.
 * @param _query - The FacetQuery containing the actor.
 *
 * @return An array of artifact definitions for npm projects.
 */
export const queryArtifacts: FacetQueryFunction<'package-manager:artifacts'> = async (
  _ctx,
  _query
) => {
  return [
    {
      type: 'file',
      name: 'package-lock.json',
      roles: ['dependency-lock'],
      origin: 'generated',
      regenerable: 'lossy',
      vcs: 'recommended',
    },
    {
      type: 'dir',
      name: 'node_modules',
      role: ['dependency-store'],
      origin: 'generated',
      regenerable: 'always',
      vcs: 'never',
    },
  ]
}
