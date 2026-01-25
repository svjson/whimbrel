import path from 'node:path'

import { DetectedFacet, DetectFunction } from '@whimbrel/core-api'
import { ProjectConfig } from '@whimbrel/project'
import { PackageJSON, resolveWorkspaces } from '@whimbrel/package-json'

export const detect: DetectFunction = async (ctx, dir) => {
  const pkgJson = await PackageJSON.readIfExists(ctx.disk, dir)

  if (pkgJson) {
    let detected = pkgJson.isDeclaredPackageManager('npm')
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

    if (!pkgJson.getPackageManager()) {
      if (await ctx.disk.exists(path.join(dir, 'package-lock.json'))) {
        detected = true
      }

      for (const scriptId of pkgJson.getScriptNames()) {
        const scriptCommand = pkgJson.getScript(scriptId)
        if (typeof scriptCommand === 'string') {
          if (scriptCommand.startsWith('npm ') || scriptCommand.includes(' npm ')) {
            detected = true
          }
        }
      }
    }

    const workspaces = pkgJson.get('workspaces')
    if (
      workspaces &&
      (Array.isArray(workspaces) || Array.isArray(pkgJson.get('workspaces.packages')))
    ) {
      detected = true
      config.workspaceRoot = true

      const globs = Array.isArray(workspaces)
        ? workspaces
        : pkgJson.get<string[]>('workspaces.packages')

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
              } as ProjectConfig,
            },
          },
        ],
      }
    }

    if (detected) {
      const pkgMan = pkgJson.getPackageManager()
      if (pkgMan?.name === 'npm' && pkgMan?.version) {
        detectResult.facet.scope.config.version = pkgMan.version
      }

      return detectResult
    }
  }

  return {
    detected: false,
  }
}
