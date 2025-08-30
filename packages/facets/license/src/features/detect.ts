import { DetectFunction, FacetDetectionResult, WhimbrelContext } from '@whimbrel/core-api'
import path from 'node:path'

export const detect: DetectFunction = async (
  ctx: WhimbrelContext,
  dir: string
): Promise<FacetDetectionResult> => {
  const filePath = path.join(dir, 'LICENSE')

  if (await ctx.disk.exists(filePath)) {
    return {
      detected: true,
      facet: {
        scope: {
          roles: ['license'],
          config: {
            filePath: filePath,
          },
        },
      },
    }
  }

  return {
    detected: false,
  }
}
