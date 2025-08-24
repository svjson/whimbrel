import path from 'node:path'
import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { readPath, writePath } from '@whimbrel/walk'

export const PACKAGE_JSON__ADD_SCRIPT = 'package.json:add-script'

const execute = async (ctx: WhimbrelContext) => {
  const { actor, name, script } = ctx.step.inputs

  if (!actor.facets['package.json']) {
    return
  }

  const pkgJsonPath = path.join(actor.root, 'package.json')

  const packageJson = await ctx.disk.readJson(pkgJsonPath)

  writePath(packageJson, ['scripts', name], script)

  await ctx.disk.writeJson(pkgJsonPath, packageJson)
}

export const AddScript = makeTask({
  id: PACKAGE_JSON__ADD_SCRIPT,
  name: 'Add package.json Script',
  execute: execute,
  parameters: {
    actor: {
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
