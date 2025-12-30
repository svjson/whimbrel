import { DetectFunction, FacetDetectionResult, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON } from '@whimbrel/package-json'

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
