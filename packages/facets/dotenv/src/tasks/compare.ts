import { actorFacetConfig, makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { pushDistinct } from '@whimbrel/array'
import { DotEnvFile } from '@src/adapters'
import { beginFlow } from '@whimbrel/flow'

/**
 * Identifier for the Compare .env files task.
 */
export const DOTENV__COMPARE = 'dotenv:compare'

/**
 * Execute the Compare .env files task.
 *
 * This function reads multiple .env files for a specified actor target,
 */
const execute = async (ctx: WhimbrelContext) => {
  const { target } = ctx.step.inputs

  const actorDotEnv = actorFacetConfig(target, 'dotenv')
  if (!actorDotEnv) {
    return
  }

  const flow = beginFlow(ctx)
    .let('files', () => DotEnvFile.readAll(ctx.disk, target.root, actorDotEnv.files), {
      journal: ({ name, value }) => ({
        name,
        value: value.map((file) => file.getFileName()).join(', '),
      }),
    })
    .let(
      'byFile',
      ({ files }) =>
        files.reduce(
          (agg, file) => {
            agg[file.getFileName()] = file.propertyNames()
            return agg
          },
          {} as Record<string, string[]>
        ),
      true
    )
    .let(
      'allProps',
      ({ byFile }) =>
        Object.values(byFile).reduce((keys, fileKeys) => {
          pushDistinct(keys, ...fileKeys)
          return keys
        }, [] as string[]),
      true
    )
    .let('missingProps', ({ byFile, allProps }) => {}, true)

  ;(actorDotEnv.files as string[]).reduce(
    (flow, fileName: string) =>
      flow.let(`absent properties in ${fileName}`, ({ byFile, allProps }) =>
        allProps.filter((prop) => byFile[fileName].includes(prop))
      ),
    flow
  )

  await flow.run()
}

/**
 * Task for comparing properties across .env files of a single actor.
 *
 * This task reads multiple .env files as specified in the actor's dotenv
 * facet configuration and compares their properties. It identifies any
 * missing properties across the files and journals the results.
 */
export const Compare = makeTask({
  id: DOTENV__COMPARE,
  name: 'Compare .env files',
  execute,
  fsMode: 'r',
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }, { ref: 'source' }],
    },
  },
})
