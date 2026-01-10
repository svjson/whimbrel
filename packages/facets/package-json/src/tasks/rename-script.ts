import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON } from '@src/adapters'

/**
 * Global identifier for the RenameScript task.
 */
export const PACKAGE_JSON__RENAME_SCRIPT = 'package.json:rename-script'

/**
 * Executes the RenameScript task.
 *
 * Renames a script in the package.json from one name to another.
 * This requires the script to exist in the first place. Executing
 * the task with a value for `from` that is not present in the
 * scripts section results in a no-op execution.
 *
 * @param ctx The Whimbrel context.
 */
const execute = async (ctx: WhimbrelContext) => {
  const { target, from, to } = ctx.step.inputs

  if (!target.facets['package.json']) {
    return
  }

  const packageJson = await PackageJSON.read(ctx.disk, target.root)

  const scriptContent = packageJson.getScript(from)
  if (scriptContent === undefined) return

  packageJson.setScript(to, scriptContent)
  packageJson.deleteScript(from)

  await packageJson.write()
}

/**
 * Task that renames a script in the scripts section of the
 * package.json file of the target actor
 */
export const RenameScript = makeTask({
  id: PACKAGE_JSON__RENAME_SCRIPT,
  name: 'Rename package.json Script',
  execute,
  fsMode: 'rw',
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }],
    },
    from: {
      type: 'string',
      required: true,
    },
    to: {
      type: 'string',
      required: true,
    },
  },
})

export default RenameScript
