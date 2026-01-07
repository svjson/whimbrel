import { makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { readPath, writePath } from '@whimbrel/walk'

/**
 * Global identifier for the EachSubmodule task
 */
export const PROJECT__EACH_SUBMODULE = 'project:each-submodule'

/**
 * Executes EachSubmodule.
 *
 * Modifies the context during the materialization phase of the Whimbrel
 * execution plan.
 *
 * Will be a no-op execution once materialized, and serve only as an umbrella
 * task for the task tree generated for each submodule.
 *
 * @param ctx The Whimbrel context.
 */
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

/**
 * Generic task that can be used to generate sub-tasks for each
 * identified actor/project submodule.
 *
 * Generally used during StepAugmentationGenerator execution.
 */
export const EachSubmodule = makeTask({
  id: PROJECT__EACH_SUBMODULE,
  name: 'Each Submodule',
  fsMode: '-',
  execute,
})

export default EachSubmodule
