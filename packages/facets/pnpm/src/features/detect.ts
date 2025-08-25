import path from 'node:path'

import { DetectedFacet, DetectFunction } from '@whimbrel/core-api'
import { readPath } from '@whimbrel/walk'

const isDeclared = (pkgJson: any) => {
  const packageManager = pkgJson.packageManager
  const asEngine = readPath(pkgJson, 'engines.pnpm')
  if (packageManager) {
    const [name] = packageManager.split('@')
    if (name === 'pnpm') {
      return true
    }
  } else if (asEngine) {
    return true
  }
  return false
}

export const detect: DetectFunction = async (ctx, dir) => {
  const packageJsonPath = path.join(dir, 'package.json')

  if (await ctx.disk.exists(packageJsonPath)) {
    const pkgJson = await ctx.disk.readJson(packageJsonPath)

    let detected = isDeclared(pkgJson)
    const config: any = {}
    const detectResult: DetectedFacet = {
      detected: true,
      facet: {
        scope: {
          roles: ['pkg-manager'],
          config,
        },
      },
    }

    if (detected) {
      return detectResult
    }
  }

  return {
    detected: false,
  }
}
