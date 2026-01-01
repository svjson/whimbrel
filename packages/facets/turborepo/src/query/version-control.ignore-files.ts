import { FacetQueryFunction, WhimbrelContext } from '@whimbrel/core-api'

/**
 * Query implementation of `version-control:ignore-files`.
 *
 * This implementation provides a default ignore pattern for Turborepo
 * projects, specifically ignoring the `.turbo` directory.
 *
 * @param _ctx - The Whimbrel context (not used).
 * @param _query - The FacetQuery (not used).
 *
 * @return An array containing the ignore pattern for the `.turbo` directory.
 */
export const queryVersionControlIgnoreFiles: FacetQueryFunction<
  'version-control:ignore-files'
> = async (_ctx: WhimbrelContext, _query) => {
  return [{ pattern: '.turbo', groups: ['tools'], source: 'turborepo' }]
}
