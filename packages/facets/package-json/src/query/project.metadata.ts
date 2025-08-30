import { PackageJSON } from '@src/adapters'
import { FacetQuery, WhimbrelContext } from '@whimbrel/core-api'

export const queryProjectMetadata = async (
  ctx: WhimbrelContext,
  { actor }: FacetQuery
) => {
  const pkgJson = await PackageJSON.readIfExists(ctx.disk, actor.root)

  if (pkgJson) {
    return {
      name: pkgJson.get('name'),
      version: pkgJson.get('author'),
      license: pkgJson.get('license'),
      author: pkgJson.get('author'),
    }
  }
}

export default queryProjectMetadata
