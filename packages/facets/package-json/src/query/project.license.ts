import { PackageJSON } from '@src/adapters'
import { FacetQuery, WhimbrelContext } from '@whimbrel/core-api'

export const queryProjectLicense = async (
  ctx: WhimbrelContext,
  { actor }: FacetQuery
) => {
  const pkgJson = await PackageJSON.readIfExists(ctx.disk, actor.root)

  if (pkgJson) {
    const license = pkgJson.get('license')
    if (license) {
      return {
        spdx: license,
      }
    }
  }
}

export default queryProjectLicense
