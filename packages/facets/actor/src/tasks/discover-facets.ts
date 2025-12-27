import { FacetId, FacetScopes, makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { detectFacets } from '@whimbrel/facet'
import { beginFlow } from '@whimbrel/flow'
import { readPath } from '@whimbrel/walk'

export const ACTOR__DISCOVER_FACETS = 'actor:discover-facets'

/**
 * Extract `FacetId` from all facets scoped as type `type` in
 * `FacetScopes`.
 *
 * @param facets - The FacetScopes to search
 * @param type - The type to filter by
 *
 * @returns An array of FacetIds matching the type
 */
const facetsOfType = (facets: FacetScopes, type: string) =>
  Object.entries(facets)
    .filter(([_, scope]) => scope.roles?.includes(type))
    .map(([id]) => id)

/**
 * Extract `FacetId` from all facets not scoped as any of the given
 * `roles` in `FacetScopes`.
 */
const facetsNotOfTypes = (facets: FacetScopes, roles: string[], listed: string[]) =>
  Object.entries(facets)
    .filter(
      ([f, scope]) =>
        !scope.roles.some((role) => roles.includes(role)) && !listed.includes(f)
    )
    .map(([id]) => id)

/**
 * Get a property from a facet's config by its FacetId.
 *
 * @param facets - The FacetScopes to search
 * @param facetId - The FacetId of the facet to read from
 * @param propertyPath - The property path within the facet's config
 *
 * @returns The value at the property path, or undefined if not found
 */
const facetProperty = (facets: FacetScopes, facetId: FacetId, propertyPath: string) => {
  const facet = facets[facetId]
  if (!facet) return

  return readPath(facet, `config.${propertyPath}`)
}

/**
 * List of scopes/roles to aggregate discovered facets by.
 *
 * @remarks
 * These roles will be extracted individually; any facets not matching
 * these roles will be grouped under "other facets".
 */
const ENUM_ROLES = [
  'language',
  'engine',
  'pkg-manager',
  'pkg-file',
  'version-control',
  'build-config',
  'build-tool',
  'config',
  'ci',
]

/**
 * Determine if a flow variable result is considered "empty"
 * for flow/step reporting purposes.
 *
 * @param value - The flow variable value
 * @returns True if the value is empty, false otherwise
 */
const emptyResult = ({ value }) => !(typeof value === 'string' && value.length > 0)

/**
 * Execute the Discover Facets task.
 *
 * This task runs the `detect` feature of all configured facets and
 * registered any discovered facets on the actor.
 *
 * Discovery results are grouped by a pre-defined set of actor roles
 * for reporting purposes, but does not affect actor configuration.
 *
 * @remarks
 * The discovered facets are registered on the actor under its
 * `facets` property.
 *
 * @param ctx - The Whimbrel context
 *
 * @returns A promise that resolves when the task is complete
 */
export const execute = async (ctx: WhimbrelContext) => {
  const { actor } = ctx.step.inputs

  const detectionResult = await detectFacets(ctx, actor.root)
  const facets = detectionResult.detected
  actor.facets = facets

  const enumRoles = [...ENUM_ROLES]

  const readme = facetProperty(facets, 'readme', 'config.file')
  const license = facetProperty(facets, 'license', 'config.id')

  const listed = [
    ['readme', readme],
    ['license', license],
  ]
    .filter(([_, v]) => v)
    .map(([f, _]) => f)

  await beginFlow(ctx)
    .let('language', facetsOfType(facets, 'language').join(', '), {
      private: emptyResult,
    })
    .let('vcs', facetsOfType(facets, 'version-control').join(', '), {
      private: emptyResult,
    })
    .let('engine', facetsOfType(facets, 'engine').join(', '), { private: emptyResult })
    .let('package-manager', facetsOfType(facets, 'pkg-manager').join(', '), {
      private: emptyResult,
    })
    .let('package-file', facetsOfType(facets, 'pkg-file').join(', '), {
      private: emptyResult,
    })
    .let('build-tool', facetsOfType(facets, 'build-tool').join(', '), {
      private: emptyResult,
    })
    .let('build-config', facetsOfType(facets, 'build-config').join(', '), {
      private: emptyResult,
    })
    .let('ci', facetsOfType(facets, 'ci').join(', '), { private: emptyResult })
    .let('license', license, { private: emptyResult })
    .let('readme', readme, { private: emptyResult })
    .let('config', facetsOfType(facets, 'config').join(', '), { private: emptyResult })
    .let('facets', facetsNotOfTypes(facets, enumRoles, listed).join(', '), {
      private: emptyResult,
    })
    .run()
}

/**
 * Whimbrel Task for discovering and registering facets on an actor.
 *
 * @remarks
 * This task runs the `detect` feature of all configured facets and
 * registered any discovered facets on the actor.
 */
export const DiscoverFacets = makeTask({
  id: ACTOR__DISCOVER_FACETS,
  name: 'Discover Actor Facets',
  fsMode: 'r',
  execute,
  parameters: {
    actor: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'source' }, { ref: 'target' }],
    },
  },
})

export default DiscoverFacets
