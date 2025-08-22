import { Actor, FacetQuery, FacetQueryResult, WhimbrelContext } from '@whimbrel/core-api'

export const queryFacets = async (
  ctx: WhimbrelContext,
  actor: Actor,
  query: FacetQuery
): Promise<FacetQueryResult[]> => {
  const queryResults: FacetQueryResult[] = []

  for (const facetId of Object.keys(actor.facets)) {
    const facetModule = ctx.facets.get(facetId)

    const queryFunction = facetModule.queryIndex[query.type]
    if (queryFunction) {
      const result = await queryFunction(ctx, query)
      if (result) {
        queryResults.push({ source: facetId, result })
      }
    }
  }
  return queryResults
}
