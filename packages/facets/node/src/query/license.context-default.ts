import { FacetQueryFunction, WhimbrelContext } from '@whimbrel/core-api'

/**
 * Query implementation of `license:context-default`.
 *
 * The default license in the NodeJS community is considered to be
 * MIT.
 *
 * @param _ctx - The Whimbrel context (not used).
 * @param _query - The FacetQuery (not used).
 */
export const queryLicenseContextDefault: FacetQueryFunction<
  'license:context-default'
> = async (_ctx: WhimbrelContext, _query) => {
  return 'MIT'
}

export default queryLicenseContextDefault
