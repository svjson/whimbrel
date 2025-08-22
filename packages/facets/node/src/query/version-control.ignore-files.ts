import { FacetQuery, WhimbrelContext } from '@whimbrel/core-api'

export const queryVersionControlIgnoreFiles = async (
  _ctx: WhimbrelContext,
  _query: FacetQuery
) => {
  return [{ pattern: 'node_modules', groups: ['generated'], source: 'node' }]
}
