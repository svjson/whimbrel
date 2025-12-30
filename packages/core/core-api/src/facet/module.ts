import { Task, TaskId } from '@src/task'
import { FacetDeclaration, FacetId } from './declaration'
import { QueryIndex } from './query'
import { TaskAugmentations } from '@src/plan'
import { DetectFunction } from './detect'
import { MergeConfigFunction } from './config'

/**
 * Allows describing a Facet without providing properties for which there
 * are suitable default values (empty arrays or objects, etc).
 */
export interface FacetModulePrototype {
  /**
   * The unique identifier of this facet.
   */
  id: FacetId
  /**
   * Tasks to be provided by this facet.
   */
  tasks?: Record<TaskId, Task>
  /**
   * Query executors to be provided by this facet.
   */
  queryIndex?: QueryIndex
  /**
   * Task augmentations to be provided by this facet.
   */
  taskAugmentations?: TaskAugmentations
  /**
   * Implicit facets to be assigned to any Actor that
   * this facet is assigned to.
   */
  implicits?: FacetDeclaration[]
  /**
   * Declares how this facet can be detected on an Actor.
   */
  detect?: DetectFunction
  /**
   * Enables a facet to provide its own mechanism for merging two or more
   * configuration objects for the facet.
   */
  mergeConfig?: MergeConfigFunction
}

/**
 * Describes a fully formed FacetModule
 */
export interface FacetModule {
  /**
   * The unique identifier of this facet.
   */
  id: FacetId
  /**
   * Tasks provided by this facet.
   */
  tasks: Record<TaskId, Task>
  /**
   * Query executors provided by this facet.
   */
  queryIndex: QueryIndex
  /**
   * Task augmentations provided by this facet.
   */
  taskAugmentations: TaskAugmentations
  /**
   * Implicit facets that are assigned to any Actor that
   * this facet is assigned to.
   */
  implicits: FacetDeclaration[]
  /**
   * Function to detect if this facet is applicable to a given Actor.
   */
  detect?: DetectFunction
  /**
   * Enables a facet to provide its own mechanism for merging two or more
   * configuration objects for the facet.
   */
  mergeConfig?: MergeConfigFunction
  /**
   * Retrieve a Task provided by this facet by its name.
   *
   * @param taskName The name of the task to retrieve
   * @returns The Task instance
   */
  getTask(taskName: string): Task
}
