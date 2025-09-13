import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { readPath, writePath } from '@whimbrel/walk'

export const PROJECT__EACH_SUBMODULE = 'project:each-submodule'

const execute = async (ctx: WhimbrelContext) => {
  const inputs = { ...ctx.step.inputs }

  if (inputs.materialized) {
    delete inputs.materialized
  }

  if (!readPath(ctx, 'step.inputs.materialized')) {
    writePath(ctx, 'step.inputs.materialized', inputs)
    ctx.acceptMutation({
      mutationType: 'ctx',
      type: 'set',
      path: 'step.inputs.materialized',
      key: 'materialized',
    })
  }
}

export const EachSubmodule = makeTask({
  id: PROJECT__EACH_SUBMODULE,
  name: 'Each Submodule',
  fsMode: '-',
  execute,
})

export default EachSubmodule
