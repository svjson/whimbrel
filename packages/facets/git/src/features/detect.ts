import { findRepositoryRoot } from '@src/adapters'
import { FacetDetectionResult, WhimbrelContext } from '@whimbrel/core-api'

/**
 * Detects if the current directory is part of a git repository.
 *
 * @param ctx - The Whimbrel context.
 * @param dir - The directory to scan.
 *
 * @returns A promise that resolves to the detection result.
 */
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
