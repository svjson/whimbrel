import { describe, it, expect } from 'vitest'
import { makeFacetModule, makeTask, moduleTasks } from '@src/index'

describe('makeFacetModule', () => {
  describe('getTask', () => {
    it('should return task identified by the task name', () => {
      // Given
      const module = makeFacetModule({
        id: 'test-facet',
        tasks: moduleTasks(
          makeTask({ id: 'test-facet:dummy-task' }),
          makeTask({ id: 'test-facet:other-task' })
        ),
      })

      // When
      const task = module.getTask('dummy-task')

      // Then
      expect(task.id).toEqual('test-facet:dummy-task')
    })

    it('should return task identified by the fully namespaced task id', () => {
      // Given
      const module = makeFacetModule({
        id: 'test-facet',
        tasks: moduleTasks(
          makeTask({ id: 'test-facet:dummy-task' }),
          makeTask({ id: 'test-facet:other-task' })
        ),
      })

      // When
      const task = module.getTask('test-facet:dummy-task')

      // Then
      expect(task.id).toEqual('test-facet:dummy-task')
    })
  })
})
