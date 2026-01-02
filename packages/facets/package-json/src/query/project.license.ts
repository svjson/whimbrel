import { PackageJSON } from '@src/adapters'
import { FacetQuery, FacetQueryFunction, WhimbrelContext } from '@whimbrel/core-api'

/**
 * Query implementation of `project:license` that responds with
 * the license spdx defined by package.json, if present.
 *
 * @param ctx - The Whimbrel context.
 * @param query - The FacetQuery containing the actor whose
 *                package.json to inspect
 */
export const queryProjectLicense: FacetQueryFunction<'project:license'> = async (
  ctx: WhimbrelContext,
  { actor }
) => {
  const pkgJson = await PackageJSON.readIfExists(ctx.disk, actor.root)

  if (pkgJson) {
    const license = pkgJson.get<string>('license')
    if (license) {
      return {
        spdx: license,
      }
    }
  }
}

export default queryProjectLicense
