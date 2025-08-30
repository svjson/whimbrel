import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON } from '@src/adapters'

export const PACKAGE_JSON__ADD_SCRIPT = 'package.json:add-script'

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

export const AddScript = makeTask({
  id: PACKAGE_JSON__ADD_SCRIPT,
  name: 'Add package.json Script',
  execute,
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
