import path from 'node:path'
import { FacetQuery, WhimbrelContext } from '@whimbrel/core-api'
import { readPath } from '@whimbrel/walk'

export const queryVersionControlIgnoreFiles = async (
  ctx: WhimbrelContext,
  { actor }: FacetQuery
) => {
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
