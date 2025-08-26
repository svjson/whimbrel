import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON } from '@src/adapters'

export const PACKAGE_JSON__REMOVE_SCRIPT = 'package.json:remove-script'

const execute = async (ctx: WhimbrelContext) => {
  const { target, name, script } = ctx.step.inputs

  if (!target.facets['package.json']) {
    return
  }

  const packageJson = await PackageJSON.read(ctx.disk, [target.root, 'package.json'])

  if (script && packageJson.get(['scripts', name]) !== script) {
    return
  }

  packageJson.delete(['scripts', name])

  await packageJson.write()
}

export const RemoveScript = makeTask({
  id: PACKAGE_JSON__REMOVE_SCRIPT,
  name: 'Remove package.json Script',
  execute: execute,
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
      required: false,
    },
  },
})
