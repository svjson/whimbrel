import { FacetDetectionResult, DetectFunction, WhimbrelContext } from '@whimbrel/core-api'

/**
 * Detects if a directory contains dotenv configuration files.
 *
 * @param ctx - The Whimbrel context
 * @param dir - The directory to scan
 *
 * @returns A promise that resolves to the detection result
 */
export const detect: DetectFunction = async (
  ctx: WhimbrelContext,
  dir: string
): Promise<FacetDetectionResult> => {
  const files = await ctx.disk.scanDir(dir, {
    depth: 0,
    filter: (fe) => {
      const match = fe.name.match(/^.env(\..*)?/)
      return match !== null && fe.type === 'file'
    },
  })

  if (files.length) {
    return {
      detected: true,
      facet: {
        scope: {
          roles: ['config'],
          config: {
            rootDir: dir,
            files: files.map((f) => f.name),
          },
        },
      },
    }
  }

  return {
    detected: false,
  }
}
