import { Task } from '@src/task'
import { FacetId } from './declaration'
import { FacetModule } from './module'

/**
 * FacetRegistry interface which defines methods for registering, retrieving,
 * and listing FacetModules available to the Whimbrel Runtime.
 */
export interface FacetRegistry {
  register(facet: FacetModule): void
  get(facetId: FacetId): FacetModule | undefined
  all(): FacetModule[]
  lookupTask(taskId: string): Task
}
