import path from 'node:path'

import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON } from '@whimbrel/package-json'
import { pushUnique } from '@whimbrel/array'

import { PnpmWorkspaceYaml } from '@src/adapters'

export const PNPM__MIGRATE_WORKSPACES = 'pnpm:migrate-workspaces'

const execute = async (ctx: WhimbrelContext) => {
  const { target } = ctx.step.inputs
  const packageJson = await PackageJSON.read(ctx.disk, [target.root, 'package.json'])

  const workspaces: string[] = packageJson.get('workspaces')

  if (workspaces) {
    let pnpmWorkspace = await PnpmWorkspaceYaml.readIfExists(ctx.disk, target.root)
    if (!pnpmWorkspace) {
      pnpmWorkspace = new PnpmWorkspaceYaml({
        storage: ctx.disk,
        path: path.join(target.root, 'pnpm-workspace.yaml'),
      })

      const packages: string[] = pnpmWorkspace.get('packages', [])

      pushUnique(packages, ...workspaces)
      pnpmWorkspace.set('packages', packages)

      await pnpmWorkspace.write()
      packageJson.delete('workspaces')
      await packageJson.write()
    }
  }
}

export const MigrateWorkspaces = makeTask({
  id: PNPM__MIGRATE_WORKSPACES,
  name: 'Migrate workspaces to pnpm-workspaces.yaml',
  execute,
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }],
    },
  },
})
