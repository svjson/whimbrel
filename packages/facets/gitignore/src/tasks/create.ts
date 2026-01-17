import path from 'node:path'

import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { queryFacets } from '@whimbrel/facet'
import { beginFlow } from '@whimbrel/flow'
import { unique } from '@whimbrel/array'
import { purgeRedundant } from '@src/adapters/gitignore-adapter'

export const GITIGNORE__CREATE = 'gitignore:create'

const execute = async (ctx: WhimbrelContext) => {
  const { actor } = ctx.step.inputs

  await beginFlow(ctx)
    .let(
      'queryResult',
      queryFacets(ctx, actor, {
        type: 'version-control:ignore-files',
        actor,
        subModules: true,
      }),
      true
    )
    .let('contributors', ({ queryResult }) =>
      unique(queryResult.map((qr) => qr.source)).join(', ')
    )
    .let(
      'ignoreFiles',
      ({ queryResult }) => purgeRedundant(queryResult.flatMap((qr) => qr.result)),
      true
    )
    .do(async ({ ignoreFiles }) => {
      const contents = [
        '# --- Ignore Files ---',
        ...unique(ignoreFiles.map((p) => p.pattern)),
        '',
      ]
      await ctx.disk.write(
        path.join(actor.root, '.gitignore'),
        contents.join('\n'),
        'utf8'
      )
    })
    .run()
}

export const Create = makeTask({
  id: GITIGNORE__CREATE,
  name: 'Create .gitignore',
  parameters: {
    actor: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }],
    },
  },
  execute,
})
