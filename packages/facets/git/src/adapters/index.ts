import { WhimbrelContext } from '@whimbrel/core-api'
import { GitAdapter } from './git-adapter'
import { makeIsoMorphicGitAdapter } from './isomorphic-git'
import { makeNodeFsPromisesAdapter } from '@whimbrel/filesystem'
import { makeWhimbrelGitAdapter } from './whimbrel'

export { parseGitMergeOutput } from './git-adapter'

export { makeIsoMorphicGitAdapter } from './isomorphic-git'

export function makeGitAdapter(ctx: WhimbrelContext): GitAdapter
export function makeGitAdapter(ctx: WhimbrelContext, adapter: GitAdapter): GitAdapter

export function makeGitAdapter(ctx: WhimbrelContext, adapter?: GitAdapter): GitAdapter {
  if (!adapter) adapter = makeIsoMorphicGitAdapter(makeNodeFsPromisesAdapter(ctx.disk))

  return makeWhimbrelGitAdapter(ctx, adapter)
}

export const findRepositoryRoot = async (ctx: WhimbrelContext, dir: string) => {
  return makeGitAdapter(ctx).repositoryRoot(dir)
}
