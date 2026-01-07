import { describe, it, expect } from 'vitest'

import { makeWhimbrelContext } from '@src/index'
import SourceFacet, { Define as DefineSource, SOURCE__DEFINE } from '@whimbrel/source'
import ActorFacet, { ACTOR__DISCOVER_FACETS, DiscoverFacets } from '@whimbrel/actor'
import { DefaultFacetRegistry } from '@whimbrel/facet'
import { ExecutionStepBlueprint, newStepResult } from '@whimbrel/core-api'
import { generateExecutionStep } from '@src/plan/materialize'

describe('materialize', () => {
  describe('generateExecutionStep', () => {
    it('should generate a complete ExecutionStep and use the default Task name if none is provided', async () => {
      // Given
      const ctx = await makeWhimbrelContext({
        facets: new DefaultFacetRegistry([SourceFacet, ActorFacet]),
      })
      const stepBlueprint: ExecutionStepBlueprint = {
        type: SOURCE__DEFINE,
      }

      // When
      const executionStep = generateExecutionStep(ctx, stepBlueprint)

      // Then
      expect(executionStep).toEqual({
        id: SOURCE__DEFINE,
        name: 'Define Source',
        parents: [],
        task: DefineSource,
        inputs: {},
        parameters: {},
        expectedResult: newStepResult(),
        bind: {},
        meta: {},
        treeState: {
          state: 'default',
        },
        steps: [],
      })
    })

    it('should generate a complete ExecutionStep and use the parameters specified by the Task', async () => {
      // Given
      const ctx = await makeWhimbrelContext({
        facets: new DefaultFacetRegistry([SourceFacet, ActorFacet]),
      })
      const stepBlueprint: ExecutionStepBlueprint = {
        type: ACTOR__DISCOVER_FACETS,
      }

      // When
      const executionStep = generateExecutionStep(ctx, stepBlueprint)

      // Then
      expect(executionStep).toEqual({
        id: ACTOR__DISCOVER_FACETS,
        name: 'Discover Actor Facets',
        parents: [],
        task: DiscoverFacets,
        inputs: {},
        bind: {},
        meta: {},
        expectedResult: newStepResult(),
        parameters: {
          actor: {
            type: 'actor',
            required: true,
            cli: {
              positional: false,
              excludes: [],
              sets: {},
            },
            resolvers: [],
            defaults: [{ ref: 'source' }, { ref: 'target' }],
          },
        },
        steps: [],
        treeState: {
          state: 'default',
        },
      })
    })
  })
})
