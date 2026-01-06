import { DotEnvFile } from '@src/adapters'
import { getTemplateProfiles, groupByFileNameProfile } from '@src/lib/template'
import { actorFacetConfig, makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { beginFlow } from '@whimbrel/flow'

/**
 * Global identifier for the UpdateTemplates task.
 */
export const DOTENV__UPDATE_TEMPLATES = 'dotenv:update-templates'

/**
 * Execute the UpdateTemplates task.
 */
const execute = async (ctx: WhimbrelContext) => {
  const { target } = ctx.step.inputs

  const actorDotEnv = actorFacetConfig(target, 'dotenv')

  await beginFlow(ctx)
    .let(
      'files',
      async () => DotEnvFile.readAll(ctx.disk, target.root, actorDotEnv.files),
      ({ name, value }) => ({
        name,
        value: value.map((file) => file.getFileName()).join(', '),
      })
    )
    .let('profiles', ({ files }) => groupByFileNameProfile(files), {
      journal: ({ name, value }) => ({ name, value: Object.keys(value) }),
    })
    .doEach('profiles', async ([_name, profile], _) => {
      for (const template of getTemplateProfiles(profile)) {
        if (template.missingProperties.length) {
          for (const prop of template.missingProperties) {
            template.dotEnvFile.set(prop, '')
          }
          return template.dotEnvFile.write()
        }
      }
    })
    .run()
}

/**
 * Task that compares properties across groups of .env files belonging
 * to a single actor, and adds properties that are present in .env[.profile]
 * to .env[.profile].template (or .example).
 */
export const UpdateTemplates = makeTask({
  id: DOTENV__UPDATE_TEMPLATES,
  name: 'Update .env template files',
  execute,
  fsMode: 'rw',
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }],
    },
  },
})
