import { PackageJSON } from '@src/adapters'
import { FacetQuery, FacetQueryFunction, WhimbrelContext } from '@whimbrel/core-api'

export const queryProjectMetadata: FacetQueryFunction<'project:metadata'> = async (
  ctx: WhimbrelContext,
  { actor }
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
