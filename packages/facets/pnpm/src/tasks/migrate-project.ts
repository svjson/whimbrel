import { getPnpmVersion } from '@src/adapters/pnpm-adapter'
import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON } from '@whimbrel/package-json'

/**
 * Global identifier for the MigrateProject task.
 */
export const PNPM__MIGRATE_PROJECT = 'pnpm:migrate-project'

/**
 * Executes the main project migration by overwriting the
 * packageManager property of package.json.
 *
 * @param ctx The Whimbrel context.
 */
const execute = async (ctx: WhimbrelContext) => {
  const { target } = ctx.step.inputs

  const pnpmVersion = await getPnpmVersion(ctx, target.root)

  const pkgJson = await PackageJSON.read(ctx.disk, target.root)

  pkgJson.set('packageManager', `pnpm@${pnpmVersion}`)

  await pkgJson.write()
}

/**
 * Task that migrates the target actor to use pnpm as its package
 * manager.
 *
 * This task is also paired with a StepAugmentationGenerator that
 * emits any other required sub-tasks that handle things like the
 * pnpm-workspace.yaml and updating monorepo inter-dependencies.
 */
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
    allPackages: {
      type: 'boolean',
      defaults: [{ value: true }],
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
