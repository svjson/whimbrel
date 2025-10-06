import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON } from '@whimbrel/package-json'

export const PNPM__MIGRATE_PROJECT = 'pnpm:migrate-project'

const execute = async (ctx: WhimbrelContext) => {
  const { target } = ctx.step.inputs

  const [stdout] = await ctx.runCommand(target.root, ['pnpm', '--version'])
  const [pnpmVersion] = stdout.split('\n')

  const pkgJson = await PackageJSON.read(ctx.disk, target.root)

  pkgJson.set('packageManager', `pnpm@${pnpmVersion}`)

  await pkgJson.write()
}

export const MigrateProject = makeTask({
  id: PNPM__MIGRATE_PROJECT,
  name: 'Migrate project to pnpm',
  execute,
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [
        {
          ref: 'target',
        },
      ],
    },
  },
})
