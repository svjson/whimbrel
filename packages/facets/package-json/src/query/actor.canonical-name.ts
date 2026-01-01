import { PackageJSON } from '@src/adapters'
import { FacetQueryFunction, WhimbrelContext } from '@whimbrel/core-api'
import path from 'node:path'

/**
 * Query implementation of `actor:canonical-name` that responds with
 * the name defined by package.json, if present.
 *
 * @param ctx - The Whimbrel context.
 * @param query - The FacetQuery containing the actor whose
 *                package.json to inspect
 */
export const queryActorCanonicalName: FacetQueryFunction<'actor:canonical-name'> = async (
  ctx: WhimbrelContext,
  { actor }
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
