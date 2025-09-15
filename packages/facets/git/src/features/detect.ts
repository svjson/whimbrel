import { findRepositoryRoot } from '@src/adapters/git-adapter'
import { FacetDetectionResult, WhimbrelContext } from '@whimbrel/core-api'

export const detect = async (
  ctx: WhimbrelContext,
  dir: string
): Promise<FacetDetectionResult> => {
  const root = await findRepositoryRoot(ctx, dir)

  if (!root) {
    return {
      detected: false,
    }
  }

  return {
    detected: true,
    facet: {
      scope: {
        roles: ['version-control'],
        config: {
          root,
        },
      },
    },
  }
}
