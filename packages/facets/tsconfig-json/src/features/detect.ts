import path from 'node:path'

import { FacetDetectionResult, DetectFunction, WhimbrelContext } from '@whimbrel/core-api'

export const detect: DetectFunction = async (
  ctx: WhimbrelContext,
  dir: string
): Promise<FacetDetectionResult> => {
  const tsConfigJsonPath = path.join(dir, 'tsconfig.json')

  if (await ctx.disk.exists(tsConfigJsonPath)) {
    return {
      detected: true,
      facet: {
        scope: {
          roles: ['build-config'],
          config: {
            path: tsConfigJsonPath,
          },
        },
      },
      advice: {
        facets: [{ facet: 'typescript', scope: { roles: ['language'] } }],
      },
    }
  }

  return {
    detected: false,
  }
}

export default detect
