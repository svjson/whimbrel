import { Actor, FacetQuery, FacetQueryResult, WhimbrelContext } from '@whimbrel/core-api'

export const queryFacets = async (
  ctx: WhimbrelContext,
  actor: Actor,
  query: FacetQuery
): Promise<FacetQueryResult[]> => {
  const queryResults: FacetQueryResult[] = []

  for (const facetId of Object.keys(actor.facets)) {
    const facetModule = ctx.facets.get(facetId)
    if (!facetModule) continue
    const queryFunction = facetModule.queryIndex[query.type]
    if (queryFunction) {
      const result = await queryFunction(ctx, query)
      if (result) {
        queryResults.push({ source: facetId, result })
      }
    }
  }

  if (query.subModules && actor.facets.project?.config?.subModules) {
    for (const subModule of actor.facets.project?.config?.subModules) {
      const moduleActor =
        Object.values(ctx.targets).find((t) => t.root === subModule.root) ??
        Object.values(ctx.sources).find((s) => s.root === subModule.root)

      if (moduleActor) {
        queryResults.push(
          ...(await queryFacets(ctx, moduleActor, {
            ...query,
            actor: query.actor ? moduleActor : undefined,
          }))
        )
      }
    }
  }

  return queryResults
}
