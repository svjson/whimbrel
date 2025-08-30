import { FacetQuery, WhimbrelContext } from '@whimbrel/core-api'

export const queryLicenseContextDefault = async (
  _ctx: WhimbrelContext,
  _query: FacetQuery
) => {
  return 'MIT'
}

export default queryLicenseContextDefault
