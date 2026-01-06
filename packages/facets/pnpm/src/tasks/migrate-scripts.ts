import { rewriteScript } from '@src/lib'
import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { pickRankedResult, queryFacets } from '@whimbrel/facet'
import { PackageJSON } from '@whimbrel/package-json'

/**
 * Global identifier for the MigrateScripts task.
 */
export const PNPM__MIGRATE_SCRIPTS = 'pnpm:migrate-scripts'

const execute = async (ctx: WhimbrelContext) => {
  const { target } = ctx.step.inputs

  const pkgJson = await PackageJSON.read(ctx.disk, target.root)

  const scripts = await Promise.all(
    pkgJson.getScriptNames().map(async (scriptId) => {
      const qr = await queryFacets(ctx, target, {
        type: 'package-manager:explain-script',
        actor: target,
        criteria: { scriptId },
      })

      const expl = pickRankedResult(target, qr, [{ role: 'package-manaager' }])
      return {
        scriptId,
        description: expl,
      }
    })
  )

  for (const script of scripts) {
    const { scriptId, description } = script
    if (description) {
      pkgJson.setScript(scriptId, rewriteScript(description))
    }
  }

  await pkgJson.write()
}

/**
 * Task that examines all package.json scripts of a target actor and
 * updates them to use pnpm and pnpx.
 */
export const MigrateScripts = makeTask({
  id: PNPM__MIGRATE_SCRIPTS,
  name: 'Migrate all package.json scripts to pnpm/pnpx usage',
  execute,
  fsMode: 'rw',
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }],
    },
  },
})
