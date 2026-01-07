import { describe, expect, it } from 'vitest'

import {
  expandStep,
  generateExecutionStep,
  makeIterationContext,
} from '@src/plan/materialize'
import { makeTask, makeWhimbrelContext, moduleTasks } from '@src/index'
import SourceFacet, { SOURCE__DEFINE } from '@whimbrel/source'
import { DefaultFacetRegistry } from '@whimbrel/facet'
import { extractStepStructure, testFacetBuilder } from './fixtures'

describe('materialize', () => {
  describe('expandStep', () => {
    it('should perform and report no expansion when not available', async () => {
      const ctx = await makeWhimbrelContext({
        facets: new DefaultFacetRegistry([SourceFacet]),
      })
      const iterCtx = makeIterationContext(ctx)
      const step = generateExecutionStep(ctx, {
        type: SOURCE__DEFINE,
      })

      // When
      await expandStep(ctx, iterCtx, step)

      // Then
      expect(iterCtx).toEqual({
        sources: {},
        targets: {},
        newSteps: 0,
        totalNewSteps: 0,
        expandIterations: 0,
      })

      expect(extractStepStructure(step)).toEqual({
        id: 'source:define',
      })

      expect(step.meta).toEqual({
        appliedAugmentations: [],
      })
    })

    it('should augment step when augmenting facet is present', async () => {
      // Given
      const ctx = await makeWhimbrelContext({
        facets: new DefaultFacetRegistry([
          SourceFacet,
          testFacetBuilder()
            .id('test-dummy')
            .tasks('dummy-task')
            .augmentationFor(SOURCE__DEFINE, (b) => b.attach('test-dummy:dummy-task'))
            .build(),
        ]),
      })
      const iterCtx = makeIterationContext(ctx)
      const step = generateExecutionStep(ctx, {
        type: SOURCE__DEFINE,
      })

      // When
      await expandStep(ctx, iterCtx, step)

      // Then
      expect(iterCtx).toEqual({
        sources: {},
        targets: {},
        newSteps: 1,
        totalNewSteps: 0,
        expandIterations: 0,
      })

      expect(extractStepStructure(step)).toEqual({
        id: 'source:define',
        steps: [{ id: 'test-dummy:dummy-task' }],
      })

      expect(step.meta).toEqual({
        appliedAugmentations: [
          {
            type: 'test-dummy:dummy-task',
          },
        ],
      })
    })

    it('should not repeat augmentation on subsequent calls', async () => {
      // Given
      const ctx = await makeWhimbrelContext({
        facets: new DefaultFacetRegistry([
          SourceFacet,
          testFacetBuilder()
            .id('test-dummy')
            .tasks('dummy-task')
            .augmentationFor(SOURCE__DEFINE, (b) => b.attach('test-dummy:dummy-task'))
            .build(),
        ]),
      })
      const iterCtx = makeIterationContext(ctx)
      const step = generateExecutionStep(ctx, {
        type: SOURCE__DEFINE,
      })

      // When
      await expandStep(ctx, iterCtx, step)
      await expandStep(ctx, iterCtx, step)
      await expandStep(ctx, iterCtx, step)

      // Then
      expect(iterCtx).toEqual({
        sources: {},
        targets: {},
        newSteps: 1,
        totalNewSteps: 0,
        expandIterations: 0,
      })

      expect(extractStepStructure(step)).toEqual({
        id: 'source:define',
        steps: [{ id: 'test-dummy:dummy-task' }],
      })

      expect(step.meta).toEqual({
        appliedAugmentations: [
          {
            type: 'test-dummy:dummy-task',
          },
        ],
      })
    })
  })
})
