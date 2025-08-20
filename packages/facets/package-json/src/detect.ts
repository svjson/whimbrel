import path from 'node:path'

import { FacetDetectionResult, DetectFunction, WhimbrelContext } from '@whimbrel/core-api'

export const detect: DetectFunction = async (
  ctx: WhimbrelContext,
  dir: string
): Promise<FacetDetectionResult> => {
  const packageJsonPath = path.join(dir, 'package.json')

  if (await ctx.disk.exists(packageJsonPath)) {
    return {
      detected: true,
      facet: {
        scope: {
          roles: ['pkg-file'],
          config: {
            path: packageJsonPath,
          },
        },
      },
    }
  }

  return {
    detected: false,
  }
}

export default detect
