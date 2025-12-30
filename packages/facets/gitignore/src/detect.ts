import path from 'node:path'

import { FacetDetectionResult, DetectFunction, WhimbrelContext } from '@whimbrel/core-api'

/**
 * Detects if a .gitignore file exists in the given directory.
 *
 * @param ctx - The Whimbrel context.
 * @param dir - The directory to scan.
 */
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
          roles: ['version-control', 'ignore-file'],
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
