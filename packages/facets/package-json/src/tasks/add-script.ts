import path from 'node:path'
import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { readPath, writePath } from '@whimbrel/walk'

export const PACKAGE_JSON__ADD_SCRIPT = 'package.json:add-script'

const execute = async (ctx: WhimbrelContext) => {
  const { target, name, script } = ctx.step.inputs

  if (!target.facets['package.json']) {
    return
  }

  const pkgJsonPath = path.join(target.root, 'package.json')
  const packageJson = await ctx.disk.readJson(pkgJsonPath)

  writePath(packageJson, ['scripts', name], script)

  await ctx.disk.writeJson(pkgJsonPath, packageJson)
}

export const AddScript = makeTask({
  id: PACKAGE_JSON__ADD_SCRIPT,
  name: 'Add package.json Script',
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
      required: true,
    },
  },
})
