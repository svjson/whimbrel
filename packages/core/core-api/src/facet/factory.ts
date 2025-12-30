import { WhimbrelError } from '@src/core'
import { NoDetectFunction } from './detect'
import { FacetModule, FacetModulePrototype } from './module'
import { Task } from '@src/task'

/**
 * Construct a FacetModule instance from a FacetModulePrototype.
 *
 * This is recommended for use by all facet packages to declare the main
 * export.
 *
 * @param module - The FacetModulePrototype to construct the FacetModule from.
 * @returns The constructed FacetModule.
 */
export const makeFacetModule = (module: FacetModulePrototype): FacetModule => {
  const facetModule = {
    id: module.id,
    tasks: module.tasks ?? {},
    queryIndex: module.queryIndex ?? {},
    taskAugmentations: module.taskAugmentations ?? {},
    implicits: module.implicits ?? [],
    detect: module.detect ?? NoDetectFunction,
    mergeConfig: module.mergeConfig,
    getTask(taskName: string): Task {
      const nameParts = taskName.split(':')
      const taskId = nameParts.length == 2 ? taskName : `${facetModule.id}:${taskName}`

      const task = facetModule.tasks[taskId]
      if (!task) {
        throw new WhimbrelError(
          `Facet '${facetModule.id}' does not provide task '${taskId}'.`
        )
      }
      return task
    },
  }

  return facetModule
}
