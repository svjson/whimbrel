import { FacetQuery, WhimbrelContext } from '@whimbrel/core-api'

export const queryVersionControlIgnoreFiles = async (
  _ctx: WhimbrelContext,
  _query: FacetQuery
) => {
  return [{ pattern: '.pnpm-store', groups: ['generated'], source: 'pnpm' }]
}
