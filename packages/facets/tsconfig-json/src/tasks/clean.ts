import { TsConfigJSON } from '@src/adapters'
import { makeTask, WhimbrelContext } from '@whimbrel/core-api'

export const TSCONFIG_JSON__CLEAN = 'tsconfig.json:clean'

const execute = async (ctx: WhimbrelContext) => {
  const { target, fileName = 'tsconfig.json' } = ctx.step.inputs

  const hierarchy = await TsConfigJSON.readHierarchy(ctx.disk, [target.root, fileName])
  if (hierarchy) {
    for (let i = 0; i < hierarchy.length - 1; i++) {
      const parent = hierarchy[i]
      const child = hierarchy[i + 1]
      child.removeValuesInheritedFrom(parent)
    }

    for (const file of hierarchy) {
      await file.write()
    }
  }
}

export const Clean = makeTask({
  id: TSCONFIG_JSON__CLEAN,
  name: 'Clean tsconfig.json',
  execute,
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }],
    },
    fileName: {
      type: 'string',
    },
  },
})
