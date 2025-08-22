import path from 'node:path'

import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { queryFacets } from '@whimbrel/facet'

export const GITIGNORE__CREATE = 'gitignore:create'

const execute = async (ctx: WhimbrelContext) => {
  const { actor } = ctx.step.inputs

  const queryResult = await queryFacets(ctx, actor, {
    type: 'version-control:ignore-files',
  })

  const merged = queryResult.flatMap((qr) => qr.result)

  const contents = ['# --- Ignore Files ---', ...merged.map((p) => p.pattern), '']
  await ctx.disk.write(path.join(actor.root, '.gitignore'), contents.join('\n'), 'utf8')
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
