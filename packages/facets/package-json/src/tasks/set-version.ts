import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON, WorkspaceAdapter } from '@src/adapters'
import { isVersion } from '@src/lib'

export const PACKAGE_JSON__SET_VERSION = 'package.json:set-version'

const execute = async (ctx: WhimbrelContext) => {
  const { target, version, internalDeps } = ctx.step.inputs

  if (!target.facets['package.json']) {
    return
  }

  const packageJson = await PackageJSON.read(ctx.disk, [target.root, 'package.json'])

  if (!isVersion(packageJson.get('version'), version)) {
    packageJson.set('version', version)
    await packageJson.write()
  }

  if (internalDeps) {
    const rootActor = ctx.getActor({ hasSubmodule: target.id })
    if (rootActor) {
      const ws = new WorkspaceAdapter(ctx, rootActor, packageJson)

      await ws.forEachModule(async (modulePackageJson) => {
        const updated = modulePackageJson.updateDependency(target.name, version)
        if (updated) await modulePackageJson.write()
      })
    }
  }
}

export const SetVersion = makeTask({
  id: PACKAGE_JSON__SET_VERSION,
  name: 'Set package.json version',
  execute: execute,
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }],
    },
    version: {
      type: 'string',
      required: true,
    },
    internalDeps: {
      type: 'boolean',
    },
    allPackages: {
      type: 'boolean',
      cli: {
        excludes: ['submodules', 'rootModule'],
        sets: {
          submodules: '<<value>>',
          rootModule: true,
        },
      },
    },
  },
})

export default SetVersion
