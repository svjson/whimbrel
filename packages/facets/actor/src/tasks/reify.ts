import {
  actorFacetConfig,
  ContextMutator,
  makeTask,
  WhimbrelContext,
} from '@whimbrel/core-api'
import { pickRankedResult, queryFacets } from '@whimbrel/facet'
import { ProjectConfig } from '@whimbrel/project'

export const ACTOR__REIFY = 'actor:reify'

export const execute = async (ctx: WhimbrelContext) => {
  const { actor } = ctx.step.inputs
  const mutator = new ContextMutator(ctx)

  const result = await queryFacets(ctx, actor, {
    type: 'actor:canonical-name',
    actor: actor,
  })

  const topRanked = pickRankedResult(actor, result, [{ role: 'pkg-file' }])
  if (topRanked) {
    mutator.setActorProperty(actor, 'name', topRanked as string)
  }

  const projectConfig = actorFacetConfig<ProjectConfig>(actor, 'project')
  for (const sub of projectConfig?.subModules ?? []) {
    const subActor = ctx.getActor('source', { root: sub.root })
    if (subActor) {
      mutator.addActorElement(actor, 'subModules', subActor.id)
    }
  }
}

export const Reify = makeTask({
  id: ACTOR__REIFY,
  name: 'Reify Actor',
  execute,
  parameters: {
    actor: {
      type: 'actor',
      required: true,
    },
  },
})

export default Reify
