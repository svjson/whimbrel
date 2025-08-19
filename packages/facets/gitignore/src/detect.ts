import path from 'node:path'

import { FacetDetectionResult, DetectFunction, WhimbrelContext } from '@whimbrel/core-api'

export const detect: DetectFunction = async (
  ctx: WhimbrelContext,
  dir: string
): Promise<FacetDetectionResult> => {
  const gitIgnorePath = path.join(dir, '.gitignore')

  if (await ctx.disk.exists(gitIgnorePath)) {
    return {
      detected: true,
      facet: {
        scope: {
          roles: ['version-control'],
          config: {
            path: gitIgnorePath,
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
