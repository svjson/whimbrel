import { describe, it, expect } from 'vitest'

import { makeWhimbrelContext } from '@src/index'
import SourceFacet, { SOURCE__DEFINE } from '@whimbrel/source'
import ActorFacet, { ACTOR__DISCOVER_FACETS } from '@whimbrel/actor'
import { DefaultFacetRegistry } from '@whimbrel/facet'
import { makeTask } from '@whimbrel/core-api'
import { determinePlanFsMode, generateExecutionStep } from '@src/plan/materialize'

describe('materialize', () => {
  describe('determinePlanFsMode', async () => {
    const ctx = await makeWhimbrelContext({
      facets: new DefaultFacetRegistry([SourceFacet, ActorFacet]),
    })

    it(`should return 'r' for step tree of exclusively fsMode='r' steps`, () => {
      // Given
      const stepTree = [
        generateExecutionStep(ctx, {
          type: SOURCE__DEFINE,
        }),
        generateExecutionStep(ctx, {
          type: ACTOR__DISCOVER_FACETS,
        }),
      ]

      // When
      const treeMode = determinePlanFsMode(stepTree)

      // Then
      expect(treeMode).toEqual('r')
    })

    it(`should return 'rw' for step tree of mixed 'r'/'w' steps`, () => {
      // Given
      const stepTree = [
        generateExecutionStep(ctx, {
          type: SOURCE__DEFINE,
        }),
        generateExecutionStep(ctx, {
          type: 'write-things',
          task: makeTask({
            id: 'write-things',
            fsMode: 'w',
          }),
        }),
      ]

      // When
      const treeMode = determinePlanFsMode(stepTree)

      // Then
      expect(treeMode).toEqual('rw')
    })
  })
})
