import { leftPad } from '@whimbrel/array'
import { actorFacetScope, ActorId, WhimbrelContext } from '@whimbrel/core-api'

export const outputFacetScope = (ctx: WhimbrelContext, scopeKey: string) => {
  const [actorId, facetId] = leftPad(scopeKey.split(':'), 2)

  const actors: ActorId[] = actorId
    ? [actorId]
    : [...Object.keys(ctx.sources), ...Object.keys(ctx.targets)].sort()

  for (const actorId of actors) {
    ctx.log.info()
    const actor = ctx.getActor('source', actorId) ?? ctx.getActor('target', actorId)
    if (!actor) {
      ctx.log.banner('Facet Scope', actorId, facetId)
      ctx.log.warn(`Unknown actor: ${actorId}`)
      continue
    }

    ctx.log.banner('Facet Scope', actor.name, facetId)

    const scope = actorFacetScope(actor, facetId)
    if (!scope) {
      ctx.log.warn(`Actor ${actor.name}(${actor.id}) does not have facet '${facetId}`)
      continue
    }

    ctx.log.info(JSON.stringify(scope, null, 2))
  }
}
