import path from 'node:path'

import { DetectFunction } from '@whimbrel/core-api'
import { readPath } from '@whimbrel/walk'

const isDeclared = (pkgJson: any) => {
  const packageManager = pkgJson.packageManager
  const asEngine = readPath(pkgJson, 'engines.npm')
  if (packageManager) {
    const [name] = packageManager.split('@')
    if (name === 'npm') {
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
    const config = {}
    const workspaces = pkgJson.workspaces
    if (workspaces && Array.isArray(workspaces)) {
      detected = true
    }

    if (detected) {
      return {
        detected: true,
        facet: {
          scope: {
            roles: ['pkg-manager'],
            config,
          },
        },
      }
    }
  }

  return {
    detected: false,
  }
}
