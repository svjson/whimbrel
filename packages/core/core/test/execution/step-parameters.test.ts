import { describe, expect, it } from 'vitest'

import { ensureStepParameters } from '@src/execution/step-parameters'
import { ExecutionStep, makeTask, newStepResult } from '@whimbrel/core-api'
import { makeWhimbrelContext } from '@src/index'

describe('step-parameters', () => {
  describe('ensureStepParameters', () => {
    it('should do nothing when no step parameters are specified', async () => {
      // Given
      const task = makeTask({ id: 'project:configure' })
      const ctx = await makeWhimbrelContext({})
      const stepValues = {
        id: 'myapp:project:configure',
        name: 'Configure MyApp',
        inputs: {},
        parameters: {},
        meta: {},
        treeState: { state: 'default' },
        steps: [],
      }

      const step: ExecutionStep = {
        ...stepValues,
        task,
      } as ExecutionStep

      // When
      ensureStepParameters(ctx, step)

      // Then
      expect(step).toEqual({ ...stepValues, task })
    })

    it('should assign `inputs.actor` from { ref: `source` } default value.', async () => {
      // Given
      const task = makeTask({ id: 'project:configure' })
      const ctx = await makeWhimbrelContext({})
      ctx.source = {
        id: 'MyApp',
        name: 'MyApp',
        root: '/tmp/somewhere',
        facets: {},
        meta: {},
      }
      const stepValues = {
        id: 'myapp:project:configure',
        name: 'Configure MyApp',
        parents: [],
        expectedResult: newStepResult(),
        inputs: {},
        bind: {},
        parameters: {
          actor: {
            type: 'actor',
            required: true,
            defaults: [{ ref: 'source' }],
          },
        },
        meta: {},
        treeState: { state: 'default' },
        steps: [],
      }
      const step: ExecutionStep = {
        ...structuredClone(stepValues),
        task,
      } as ExecutionStep

      // When
      ensureStepParameters(ctx, step)

      // Then
      expect(step).toEqual({
        ...stepValues,
        task,
        inputs: {
          actor: ctx.source,
        },
      })
    })
  })
})
