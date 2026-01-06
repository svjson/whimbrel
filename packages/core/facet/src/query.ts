import {
  Actor,
  FacetQuery,
  FacetQueryFunction,
  FacetQueryResult,
  InferQueryResultType,
  WhimbrelContext,
} from '@whimbrel/core-api'

/**
 * Criteria to rank facets by role.
 */
export interface FacetCriteria {
  role: string
}

/**
 * Query all facets of an actor for a specific query type.
 *
 * @param ctx The WhimbrelContext to use.
 * @param actor The actor to query facets for.
 * @param query The query to perform.
 *
 * @return An array of FacetQueryResults from the facets that responded to the query.
 */
export const queryFacets = async <QT extends string, QRS = InferQueryResultType<QT>>(
  ctx: WhimbrelContext,
  actor: Actor,
  query: FacetQuery<QT, QRS>
): Promise<FacetQueryResult<QRS>[]> => {
  const queryResults: FacetQueryResult<QRS>[] = []

  for (const facetId of Object.keys(actor.facets)) {
    const facetModule = ctx.facets.get(facetId)
    if (!facetModule) continue
    const queryFunction = facetModule.queryIndex[query.type] as FacetQueryFunction<
      QT,
      QRS
    >
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
          ...(await queryFacets<QT, QRS>(ctx, moduleActor, {
            ...query,
            actor: query.actor ? moduleActor : undefined,
          }))
        )
      }
    }
  }

  return queryResults
}

/**
 * Pick the best ranked result of a collection of FacetQueryResults.
 *
 * The ranking is done based on the order of the FacetCriteria provided.
 * The first matching FacetCriteria is used to rank the result.
 * If no FacetCriteria matches, the result is ranked lowest.
 * If multiple results have the same rank, the first one is returned.
 * If no results are provided, undefined is returned.
 *
 * @param actor The actor the results are for.
 * @param result The results to pick from.
 * @param order The order of FacetCriteria to rank the results.
 *
 * @return The best ranked result, or undefined if no results are provided.
 */
export const pickRankedResult = <T = any>(
  actor: Actor,
  result: FacetQueryResult<T>[],
  order: FacetCriteria[]
): T | undefined => {
  const ordered = [...result].sort((a: FacetQueryResult, b: FacetQueryResult) => {
    const aIndex = order.findIndex((fc) =>
      actor.facets[a.source]?.roles?.includes(fc.role)
    )
    const bIndex = order.findIndex((fc) =>
      actor.facets[b.source]?.roles?.includes(fc.role)
    )
    const facetCount = Object.keys(actor.facets).length

    return (aIndex === -1 ? facetCount : aIndex) - (bIndex === -1 ? facetCount : bIndex)
  })

  return ordered[0]?.result
}
