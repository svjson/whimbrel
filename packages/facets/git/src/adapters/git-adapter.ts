import { WhimbrelContext } from '@whimbrel/core-api'
import { makeNodeFsAdapter } from '@whimbrel/filesystem'
import isoGit from 'isomorphic-git'

/**
 * Given that directory `dir` is part of a git repository, locate the root of
 * the repository.
 *
 * @param ctx - The Whimbrel context.
 * @param dir - The directory to start searching from.
 */
export const findRepositoryRoot = async (ctx: WhimbrelContext, dir: string) => {
  return isoGit.findRoot({
    fs: makeNodeFsAdapter(ctx.disk),
    filepath: dir,
  })
}
