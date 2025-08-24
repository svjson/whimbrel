import { describe, it, expect } from 'vitest'

import { memFsContext } from '@whimbrel-test/context-fixtures'
import { makeConcreteStep } from '@whimbrel-test/step-fixtures'
import { actorAnalyzeAugmentation } from '@src/features'
import { ExecutionStep, makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { makeFacetScope } from '@whimbrel/facet'
import { PROJECT__DEFINE_SUBMODULES } from '@src/tasks'

describe('actor:analyze augmentation', () => {
  it('should not generate define-submodules augmentation if actor has no submodules', async () => {
    // Given
    const ctx = await memFsContext({
      sources: {
        'my-project': {
          id: 'my-project',
          name: 'my-project',
          root: '/tmp/somewhere',
          facets: {
            project: makeFacetScope(),
          },
          meta: {},
        },
      },
    })
    const analyzeStep: ExecutionStep = makeConcreteStep({
      bind: {
        source: 'my-project',
        key: 'source',
      },
      task: makeTask({
        id: 'actor:analyze',
        execute: async (_ctx: WhimbrelContext) => {},
      }),
    })

    // When
    const augmentations = await actorAnalyzeAugmentation({ ctx, step: analyzeStep })

    // Then
    expect(augmentations).toEqual([])
  })

  it('should generate define-submodules augmentation if actor has submodules', async () => {
    // Given
    const ctx = await memFsContext({
      sources: {
        'my-project': {
          id: 'my-project',
          name: 'my-project',
          root: '/tmp/somewhere',
          facets: {
            project: makeFacetScope({
              config: {
                subModules: [
                  {
                    root: '/tmp/somewhere/utilities/banana-util',
                  },
                  {
                    root: '/tmp/somewhere/lib/fs-lib',
                  },
                  {
                    root: '/tmp/somewhere/lib/net-lib',
                  },
                ],
              },
            }),
          },
          meta: {},
        },
      },
    })
    const analyzeStep: ExecutionStep = makeConcreteStep({
      bind: {
        source: 'my-project',
        key: 'source',
      },
      task: makeTask({
        id: 'actor:analyze',
        execute: async (_ctx: WhimbrelContext) => {},
      }),
    })

    // When
    const augmentations = await actorAnalyzeAugmentation({ ctx, step: analyzeStep })

    // Then
    expect(augmentations).toEqual([
      {
        type: PROJECT__DEFINE_SUBMODULES,
        steps: [
          {
            type: 'source:define',
            inputs: {
              source: {
                path: '/tmp/somewhere/utilities/banana-util',
              },
            },
          },
          {
            type: 'source:define',
            inputs: {
              source: {
                path: '/tmp/somewhere/lib/fs-lib',
              },
            },
          },
          {
            type: 'source:define',
            inputs: {
              source: {
                path: '/tmp/somewhere/lib/net-lib',
              },
            },
          },
        ],
      },
    ])
  })
})
