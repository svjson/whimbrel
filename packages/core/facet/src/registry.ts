import {
  FacetRegistry,
  FacetId,
  FacetModule,
  WhimbrelError,
  Task,
} from '@whimbrel/core-api'

/**
 * Default implementation of FacetRegistry.
 */
export class DefaultFacetRegistry implements FacetRegistry {
  facets: Record<FacetId, FacetModule> = {}

  constructor(facets?: Record<FacetId, FacetModule> | FacetModule[]) {
    this.facets = Array.isArray(facets)
      ? facets.reduce((result, fm) => {
          result[fm.id] = fm
          return result
        }, {})
      : (facets ?? {})
  }

  register(facet: FacetModule) {
    this.facets[facet.id] = facet
  }

  get(facetId: FacetId) {
    return this.facets[facetId]
  }

  all() {
    return Object.values(this.facets)
  }

  /**
   * Find a Task provided by a facet.
   */
  lookupTask(taskId: string): Task {
    const [facetId, taskName] = taskId.split(':')
    if (!taskName) throw new WhimbrelError(`Invalid TaskId: '${taskId}'.`)

    const facet = this.get(facetId)
    if (!facet) {
      throw new WhimbrelError(`Unknown facet '${facetId}'.`)
    }

    const task = facet.getTask(taskName)
    if (!task) {
      throw new WhimbrelError(`Facet '${facetId}' does not provide task '${taskName}'.`)
    }
    return task
  }
}

export const getFacetModule = () => {}
