import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON, WorkspaceAdapter } from '@whimbrel/package-json'

export const PNPM__SET_WORKSPACE_DEPENDENCIES = 'pnpm:set-workspace-dependencies'

const execute = async (ctx: WhimbrelContext) => {
  const { target } = ctx.step.inputs
  const packageJson = await PackageJSON.read(ctx.disk, [target.root, 'package.json'])

  const ws = new WorkspaceAdapter(
    ctx,
    ctx.rootTarget,
    await PackageJSON.read(ctx.disk, ctx.rootTarget.root)
  )
  await ws.forEachModule(async (pkgJson) => {
    packageJson.setDependencyVersion(pkgJson.get('name'), 'workspace:*')
  })

  await packageJson.write()
}

export const SetWorkspaceDependencies = makeTask({
  id: PNPM__SET_WORKSPACE_DEPENDENCIES,
  name: 'Enforce workspace dependency resolution',
  execute,
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }],
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
      defaults: [{ value: true }],
    },
  },
})
