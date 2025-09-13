import { PackageJSON } from '@src/adapters'
import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { beginFlow } from '../../../../lib/flow/dist'

export const PACKAGE_JSON__SET_PROPERTY = 'package.json:set-property'

const execute = async (ctx: WhimbrelContext) => {
  const { target, property, value } = ctx.step.inputs

  const pkgJson = await PackageJSON.readIfExists(ctx.disk, target.root)

  await beginFlow(ctx)
    .let('property', property as string)
    .let('value', value as string)
    .do(async ({ property, value }) => {
      if (pkgJson.get(property) !== value) {
        pkgJson.set(property, value)
        await pkgJson.write()
      }
    })
    .run()
}

export const SetProperty = makeTask({
  id: PACKAGE_JSON__SET_PROPERTY,
  name: 'Set package.json property',
  fsMode: 'rw',
  execute,
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }],
    },
    property: {
      type: 'string',
      required: true,
    },
    value: {
      type: 'string',
      required: true,
    },
  },
})
