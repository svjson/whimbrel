import path from 'node:path'

import { DetectedFacet, DetectFunction, WhimbrelContext } from '@whimbrel/core-api'
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

const evaluateGlob = async (
  ctx: WhimbrelContext,
  glob: string,
  root: string
): Promise<string[]> => {
  let depth = 0
  if (glob.endsWith('/*')) {
    depth = 1
  } else if (glob.endsWith('/**')) {
    depth = undefined
  }

  const scanRoot =
    typeof depth === 'number'
      ? glob
          .split('/')
          .filter((p) => !p.includes('*'))
          .join('/')
      : glob

  const pkgJsonPaths = await ctx.disk.scanDir(path.join(root, scanRoot), {
    depth,
    filter: (e) => path.basename(e.path) === 'package.json',
    ignorePredicate: (e) => ['node_modules', '.git'].includes(path.basename(e.path)),
  })

  return pkgJsonPaths.map((e) => path.dirname(e.path))
}

const resolveWorkspaces = async (
  ctx: WhimbrelContext,
  workspaces: string[],
  root: string
) => {
  const result: string[] = []
  for (const workspaceEntry of workspaces) {
    result.push(...(await evaluateGlob(ctx, workspaceEntry, root)))
  }

  return result
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
    const workspaces = pkgJson.workspaces
    if (workspaces && (Array.isArray(workspaces) || Array.isArray(workspaces.packages))) {
      detected = true
      config.workspaceRoot = true

      const globs = Array.isArray(workspaces) ? workspaces : workspaces.packages

      const subModules = await resolveWorkspaces(ctx, globs, dir)
      detectResult.advice = {
        facets: [
          {
            facet: 'project',
            scope: {
              config: {
                type: 'monorepo',
                subModules: subModules.map((modulePath) => ({
                  name: path.basename(modulePath),
                  root: modulePath,
                  relativeRoot: path.relative(dir, modulePath),
                })),
              },
            },
          },
        ],
      }
    }

    if (detected) {
      return detectResult
    }
  }

  return {
    detected: false,
  }
}
