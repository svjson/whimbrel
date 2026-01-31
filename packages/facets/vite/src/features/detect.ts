import { DetectFunction, FacetDetectionResult, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON } from '@whimbrel/package-json'

/**
 * Detects if a project using vite in any capacity.
 *
 * This simplistic implementation only checks for the presence of `vite` as
 * a dependency in the `package.json` of the projecct.
 *
 * @param ctx - The Whimbrel context.
 * @param dir - The directory to scan.
 */
export const detect: DetectFunction = async (
  ctx: WhimbrelContext,
  dir: string
): Promise<FacetDetectionResult> => {
  const pkgJson = await PackageJSON.readIfExists(ctx.disk, dir)

  const roles = []

  if (pkgJson && pkgJson.hasDependency('vite')) {
    return {
      detected: true,
      facet: {
        scope: {
          roles: roles,
        },
      },
    }
  }

  return {
    detected: false,
  }
}
