import path from 'node:path'

import { DetectedFacet, DetectFunction } from '@whimbrel/core-api'
import { ProjectConfig } from '@whimbrel/project'
import { PackageJSON, resolveWorkspaces } from '@whimbrel/package-json'
import { PnpmWorkspacesYaml } from '@src/adapters/pnpm-workspaces.yaml-adapter'

export const detect: DetectFunction = async (ctx, dir) => {
  const pkgJson = await PackageJSON.readIfExists(ctx.disk, dir)

  if (pkgJson) {
    let detected = pkgJson.isDeclaredPackageManager('pnpm')
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

    const wsYaml = await PnpmWorkspacesYaml.readIfExists(ctx.disk, dir)
    if (wsYaml) {
      const wsPackages = wsYaml.get('packages')
      if (Array.isArray(wsPackages) && wsPackages.length) {
        detected = true
        config.workspaceRoot = true

        const subModules = await resolveWorkspaces(ctx, wsPackages, dir)

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
    }

    if (detected) {
      return detectResult
    }
  }

  return {
    detected: false,
  }
}
