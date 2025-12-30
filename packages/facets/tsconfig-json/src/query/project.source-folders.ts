import { TsConfigJSON } from '@src/adapters'
import { FacetQuery, WhimbrelContext } from '@whimbrel/core-api'
import { pushUnique } from '@whimbrel/array'

const TEST_DIRS = ['test', 'spec', 'tests', 'specs']

/**
 * Query implementation of `project:source-folders` that responds with
 * the source folders defined in the actor's tsconfig.json, if present.
 *
 * This is a naive implementation that looks for `compilerOptions.rootDirs`,
 * `compilerOptions.rootDir`, and `include` fields in tsconfig.json and
 * qualifies folders named "test", "spec", "tests", or "specs" as test folders.
 *
 * @param ctx - The Whimbrel context.
 * @param query - The FacetQuery containing the actor whose tsconfig.json to
 *                inspect
 */
export const querySourceFolders = async (ctx: WhimbrelContext, { actor }: FacetQuery) => {
  if (actor) {
    const tsConfigJSON = await TsConfigJSON.readIfExists(ctx.disk, actor.root)

    if (tsConfigJSON) {
      const rootDirs = tsConfigJSON.get('compilerOptions.rootDirs')
      const rootDir = tsConfigJSON.get('compilerOptions.rootDir')
      const include = tsConfigJSON.get('include')

      const sourceDirs = []

      const addDir = (dir: string) => {
        pushUnique(sourceDirs, {
          type: TEST_DIRS.includes(dir) ? 'test' : 'source',
          dir,
        })
      }

      if (Array.isArray(rootDirs)) {
        rootDirs.forEach(addDir)
      }

      if (typeof rootDir === 'string') {
        addDir(rootDir)
      }

      if (Array.isArray(include)) {
        include.forEach(addDir)
      }

      if (sourceDirs.length) {
        return sourceDirs
      }
    }
  }
}
