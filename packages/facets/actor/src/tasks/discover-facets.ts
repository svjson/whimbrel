import { FacetId, FacetScopes, makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { detectFacets } from '@whimbrel/facet'
import { beginFlow } from '@whimbrel/flow'
import { readPath } from '@whimbrel/walk'

export const ACTOR__DISCOVER_FACETS = 'actor:discover-facets'

const facetsOfType = (facets: FacetScopes, type: string) =>
  Object.entries(facets)
    .filter(([_, scope]) => scope.roles?.includes(type))
    .map(([id]) => id)

const facetsNotOfTypes = (facets: FacetScopes, roles: string[], listed: string[]) =>
  Object.entries(facets)
    .filter(
      ([f, scope]) =>
        !scope.roles.some((role) => roles.includes(role)) && !listed.includes(f)
    )
    .map(([id]) => id)

const facetProperty = (facets: FacetScopes, facetId: FacetId, propertyPath: string) => {
  const facet = facets[facetId]
  if (!facet) return

  return readPath(facet, `config.${propertyPath}`)
}

const ENUM_ROLES = [
  'language',
  'engine',
  'pkg-manager',
  'pkg-file',
  'version-control',
  'build-config',
  'build-tool',
  'ci',
]

const emptyResult = ({ value }) => !(typeof value === 'string' && value.length > 0)

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
    .let('facets', facetsNotOfTypes(facets, enumRoles, listed).join(', '), {
      private: emptyResult,
    })
    .run()
}

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
