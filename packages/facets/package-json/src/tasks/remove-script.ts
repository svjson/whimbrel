import path from 'node:path'
import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { deletePath, readPath } from '@whimbrel/walk'

export const PACKAGE_JSON__REMOVE_SCRIPT = 'package.json:remove-script'

const execute = async (ctx: WhimbrelContext) => {
  const { target, name, script } = ctx.step.inputs

  if (!target.facets['package.json']) {
    return
  }

  const pkgJsonPath = path.join(target.root, 'package.json')
  const packageJson = await ctx.disk.readJson(pkgJsonPath)

  if (script && readPath(packageJson, ['scripts', name]) !== script) {
    return
  }

  deletePath(packageJson, ['scripts', name])

  await ctx.disk.writeJson(pkgJsonPath, packageJson)
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
