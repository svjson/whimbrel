import { FacetQueryFunction, WhimbrelContext } from '@whimbrel/core-api'

/**
 * Query implementation of `version-control:ignore-files`.
 *
 * This implementation provides a default ignore pattern for Node.js
 * projects, specifically ignoring the `node_modules` directory.
 *
 * @param _ctx - The Whimbrel context (not used).
 * @param _query - The FacetQuery (not used).
 */
export const queryVersionControlIgnoreFiles: FacetQueryFunction<
  'version-control:ignore-files'
> = async (_ctx: WhimbrelContext, _query) => {
  return [{ pattern: 'node_modules', groups: ['generated'], source: 'node' }]
}
