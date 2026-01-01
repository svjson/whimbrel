import path from 'node:path'
import { FacetQueryFunction, WhimbrelContext } from '@whimbrel/core-api'
import { readPath } from '@whimbrel/walk'

/**
 * Query implementation of `version-control:ignore-files`.
 *
 * This implementation inspects the actor's tsconfig.json
 * to determine the output directory for compiled TypeScript files,
 *
 * @param ctx - The Whimbrel context.
 * @param query - The FacetQuery containing the actor to inspect.
 *
 * @return An array of ignore file patterns based on the tsconfig.json outDir,
           if defined.
 */
export const queryVersionControlIgnoreFiles: FacetQueryFunction<
  'version-control:ignore-files'
> = async (ctx: WhimbrelContext, { actor }) => {
  if (actor) {
    const tsConfigScope = actor.facets['tsconfig.json']
    const tsConfigPath =
      tsConfigScope?.config?.path ?? path.join(actor.root, 'tsconfig.json')

    if (await ctx.disk.exists(tsConfigPath)) {
      const tsConfigJson = await ctx.disk.readJson(tsConfigPath)
      const outDir = readPath(tsConfigJson, 'compilerOptions.outDir')
      if (outDir) {
        return [
          {
            pattern: `${path.basename(outDir)}/`,
            groups: ['build'],
            source: 'tsconfig.json',
          },
        ]
      }
    }
  }
}
