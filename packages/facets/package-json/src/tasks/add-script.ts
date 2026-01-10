import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON } from '@src/adapters'

/**
 * Global identifier for the AddScript task.
 */
export const PACKAGE_JSON__ADD_SCRIPT = 'package.json:add-script'

/**
 * Executes the AddScript task.
 *
 * Adds a script to the package.json scripts section.
 * If the script with the given name already exists
 * with the same content, no changes are made.
 *
 * @param ctx The Whimbrel context.
 */
const execute = async (ctx: WhimbrelContext) => {
  const { target, name, script } = ctx.step.inputs

  if (!target.facets['package.json']) {
    return
  }

  const packageJson = await PackageJSON.read(ctx.disk, [target.root, 'package.json'])

  if (packageJson.get(['scripts', name]) === script) {
    return
  }

  packageJson.set(['scripts', name], script)

  await packageJson.write()
}

/**
 * Task that adds a script to the scripts section of the
 * package.json file of the target actor
 */
export const AddScript = makeTask({
  id: PACKAGE_JSON__ADD_SCRIPT,
  name: 'Add package.json Script',
  execute,
  fsMode: 'rw',
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }],
    },
    name: {
      type: 'string',
      required: true,
    },
    script: {
      type: 'string',
      required: true,
    },
  },
})

export default AddScript
