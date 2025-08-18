import path from 'node:path'

import { makeTask, WhimbrelContext } from '@whimbrel/core-api'

export const GITIGNORE__CREATE = 'gitignore:create'

const execute = async (ctx: WhimbrelContext) => {
  const { actor } = ctx.step.inputs
  const contents = ['# --- Misc ---', '*.log', '']
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
