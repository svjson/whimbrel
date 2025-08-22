import path from 'node:path'

import { FacetDetectionResult, DetectFunction, WhimbrelContext } from '@whimbrel/core-api'

export const detect: DetectFunction = async (
  ctx: WhimbrelContext,
  dir: string
): Promise<FacetDetectionResult> => {
  const packageJsonPath = path.join(dir, 'package.json')

  if (await ctx.disk.exists(packageJsonPath)) {
    const pkgJson = await ctx.disk.readJson(packageJsonPath)
    const dependency = [
      ...Object.keys(pkgJson.dependencies ?? {}),
      ...Object.keys(pkgJson.devDependencies ?? {}),
    ].includes('turbo')

    if (dependency) {
      return {
        detected: true,
        facet: {
          scope: {},
        },
      }
    }
  }

  return {
    detected: false,
  }
}

export default detect
