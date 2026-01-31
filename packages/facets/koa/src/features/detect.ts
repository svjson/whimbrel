import { DetectFunction, FacetDetectionResult, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON } from '@whimbrel/package-json'

/**
 * Detects if a project using Koa in any capacity.
 *
 * This simplistic implementation only checks for the presence of `koa` as
 * a dependency in the `package.json` of the projecct.
 *
 * @param ctx - The Whimbrel context.
 * @param dir - The directory to scan.
 */
export const detect: DetectFunction = async (
  ctx: WhimbrelContext,
  dir: string
): Promise<FacetDetectionResult> => {
  const pkgJSON = await PackageJSON.readIfExists(ctx.disk, dir)

  if (pkgJSON) {
    if (pkgJSON.hasDependency('koa')) {
      return {
        detected: true,
        facet: {
          scope: {
            roles: ['http-adapter'],
          },
        },
      }
    }
  }

  return {
    detected: false,
  }
}
