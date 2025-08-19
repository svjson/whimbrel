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
  'pkgfile',
  'version-control',
  'build-config',
  'build-tool',
  'ci',
]

const report = ({ value }) => typeof value === 'string' && value.length > 0

export const execute = async (ctx: WhimbrelContext) => {
  const { actor } = ctx.step.inputs

  const facets = await detectFacets(ctx, actor.root)
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
    .let('language', facetsOfType(facets, 'language').join(', '), { private: report })
    .let('vcs', facetsOfType(facets, 'version-control').join(', '), { private: report })
    .let('engine', facetsOfType(facets, 'engine').join(', '), { private: report })
    .let('package-manager', facetsOfType(facets, 'pkg-manager').join(', '), {
      private: report,
    })
    .let('package-file', facetsOfType(facets, 'pkgfile').join(', '), { private: report })
    .let('build-tool', facetsOfType(facets, 'build-tool').join(', '), { private: report })
    .let('build-config', facetsOfType(facets, 'build-config').join(', '), {
      private: report,
    })
    .let('ci', facetsOfType(facets, 'ci').join(', '), { private: report })
    .let('license', license, { private: report })
    .let('readme', readme, { private: report })
    .let('facets', facetsNotOfTypes(facets, enumRoles, listed).join(', '), {
      private: report,
    })
    .run()
}

export const DiscoverFacets = makeTask({
  id: ACTOR__DISCOVER_FACETS,
  name: 'Discover Actor Facets',
  execute,
  parameters: {
    actor: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'source' }],
    },
  },
})

export default DiscoverFacets
