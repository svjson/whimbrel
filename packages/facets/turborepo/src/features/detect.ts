import path from 'node:path'

import { FacetDetectionResult, DetectFunction, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON } from '@whimbrel/package-json'

/**
 * Detects if the project uses Turborepo by checking for 'turbo' in package.json
 * dependencies.
 *
 * @param ctx - The Whimbrel context providing access to disk and other utilities.
 * @param dir - The directory to scan for the package.json file.
 *
 * @returns A promise that resolves to the detection result indicating whether
 */
export const detect: DetectFunction = async (
  ctx: WhimbrelContext,
  dir: string
): Promise<FacetDetectionResult> => {
  const packageJsonPath = path.join(dir, 'package.json')

  if (await ctx.disk.exists(packageJsonPath)) {
    const pkgJson = await PackageJSON.read(ctx.disk, packageJsonPath)
    if (pkgJson.hasDependency('turbo')) {
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
