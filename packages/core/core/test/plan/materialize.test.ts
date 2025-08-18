import { describe, it, expect } from 'vitest'
import { makeWhimbrelContext, materializePlan } from '@src/index'
import { makeAnalyzeScaffold } from '@src/index'
import SourceFacet, { Define, SOURCE__DEFINE } from '@whimbrel/source'
import ActorFacet, {
  ACTOR__ANALYZE,
  ACTOR__DISCOVER_FACETS,
  DiscoverFacets,
} from '@whimbrel/actor'
import { DefaultFacetRegistry } from '@whimbrel/facet'
import { ExecutionStepBlueprint } from '@whimbrel/core-api'
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
        task: Define,
        inputs: {},
        parameters: {},
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
        task: DiscoverFacets,
        inputs: {},
        meta: {},
        parameters: {
          actor: {
            type: 'actor',
            required: true,
            defaults: [{ ref: 'source' }],
          },
        },
        steps: [],
        treeState: {
          state: 'default',
        },
      })
    })
  })

  describe('materializePlan', () => {
    it('should create an execution plan and attach augmented step', async () => {
      // Given
      const ctx = await makeWhimbrelContext({
        facets: new DefaultFacetRegistry([SourceFacet, ActorFacet]),
      })
      const blueprint = makeAnalyzeScaffold('/tmp/somewhere')

      // When
      const plan = await materializePlan(ctx, blueprint)

      // Then
      expect(plan).toEqual({
        steps: [
          expect.objectContaining({
            id: SOURCE__DEFINE,
            steps: [],
          }),
          expect.objectContaining({
            id: ACTOR__ANALYZE,
            steps: [
              expect.objectContaining({
                id: ACTOR__DISCOVER_FACETS,
                parameters: DiscoverFacets.parameters,
              }),
            ],
          }),
        ],
      })
    })
  })
})
