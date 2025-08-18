import {
  DeclaredFacet,
  FacetDeclaration,
  FacetScope,
  FacetScopePrototype,
  WhimbrelError,
} from '@whimbrel/core-api'

/**
 * Create a facet scope declaration entry.
 */
export const makeFacetDeclarationEntry = (
  entry: FacetDeclaration,
  additional: Record<string, any> = {}
): DeclaredFacet => {
  if (typeof entry === 'string') {
    return { facet: entry, scope: makeFacetScope(additional) }
  }

  const facetId = entry.facet
  const scope = entry.scope ?? {}

  return { facet: facetId, scope: makeFacetScope({ ...scope, ...additional }) }
}

export const deconstructFacetEntry = (entry) => {
  if (Object.keys(entry).length !== 1) {
    throw new WhimbrelError(`Invalid facet entry: ${JSON.stringify(entry)}`)
  }

  return Object.entries(entry)[0]
}

/**
 * Create a facet scope instance, ensuring default values
 * for required properties.
 *
 * @param opts - Options for the facet scope.
 * @param opts.config - Configuration object for the facet.
 * @param opts.roles - Roles associated with the facet.
 *
 * @returns - A facet scope object with roles and config.
 */
export const makeFacetScope = <CFG = any>(
  opts: FacetScopePrototype = {}
): FacetScope<CFG> => {
  const { config = {}, roles = [] } = opts
  const scope = {
    roles: [...(roles ?? [])],
    config: structuredClone(config),
  }

  for (const [key, value] of Object.entries(opts)) {
    if (!scope[key]) scope[key] = value
  }

  return scope
}

/**
 * Test if an object is a valid scope instance.
 *
 * @param scope - The scope object to validate.
 * @return True if the scope is valid, false otherwise.
 */
export const isValidScope = (scope: FacetScope<any> | FacetScopePrototype) => {
  return Boolean(
    scope &&
      scope.config &&
      typeof scope.config === 'object' &&
      !Array.isArray(scope.config) &&
      Array.isArray(scope.roles)
  )
}
