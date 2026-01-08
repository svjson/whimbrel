import { FacetQueryFunction } from '@whimbrel/core-api'

/**
 * Query-implementation of `package-manager:artifacts` for pnpm.
 *
 * @param _ctx - The Whimbrel context.
 * @param _query - The FacetQuery containing the actor.
 *
 * @return An array of artifact definitions for pnpm projects.
 */
export const queryArtifacts: FacetQueryFunction<'package-manager:artifacts'> = async (
  _ctx,
  _query
) => {
  return [
    {
      type: 'file',
      name: 'pnpm-lock.yaml',
      roles: ['dependency-lock'],
      origin: 'generated',
      regenerable: 'lossy',
      vcs: 'recommended',
    },
    {
      type: 'file',
      name: 'pnpm-workspace.yaml',
      roles: ['submodule-definition', 'package-manager-config'],
      origin: 'authored',
      regenerable: 'never',
      vcs: 'recommended',
    },
    {
      type: 'dir',
      name: 'node_modules',
      roles: ['dependency-store'],
      origin: 'generated',
      regenerable: 'always',
      vcs: 'never',
    },
  ]
}
