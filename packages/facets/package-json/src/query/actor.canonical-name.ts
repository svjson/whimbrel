import { PackageJSON } from '@src/adapters'
import { FacetQuery, WhimbrelContext } from '@whimbrel/core-api'
import path from 'node:path'

export const queryActorCanonicalName = async (
  ctx: WhimbrelContext,
  { actor }: FacetQuery
) => {
  const pkgJsonPath = path.join(actor.root, 'package.json')

  if (await ctx.disk.exists(pkgJsonPath)) {
    const pkgJson = await PackageJSON.read(ctx.disk, pkgJsonPath)

    const name = pkgJson.get('name')
    if (name) {
      return name
    }
  }
}

export default queryActorCanonicalName
