import path from 'node:path'

import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { queryFacets } from '@whimbrel/facet'
import { beginFlow } from '@whimbrel/flow'

export const GITIGNORE__CREATE = 'gitignore:create'

const execute = async (ctx: WhimbrelContext) => {
  const { actor } = ctx.step.inputs

  await beginFlow(ctx)
    .let(
      'queryResult',
      queryFacets(ctx, actor, {
        type: 'version-control:ignore-files',
      }),
      true
    )
    .let('contributors', ({ queryResult }) => queryResult.map((qr) => qr.source))
    .let('ignoreFiles', ({ queryResult }) => queryResult.flatMap((qr) => qr.result), true)
    .do(async ({ ignoreFiles }) => {
      const contents = [
        '# --- Ignore Files ---',
        ...ignoreFiles.map((p) => p.pattern),
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
