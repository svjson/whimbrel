import path from 'node:path'
import { describe, it, expect } from 'vitest'

import { makeWhimbrelContext, materializePlan } from '@src/index'
import { makeAnalyzeScaffold } from '@src/index'
import SourceFacet, { Define as DefineSource, SOURCE__DEFINE } from '@whimbrel/source'
import TargetFacet, { Define as DefineTarget, TARGET__DEFINE } from '@whimbrel/target'
import ActorFacet, {
  ACTOR__ANALYZE,
  ACTOR__DISCOVER_FACETS,
  ACTOR__REIFY,
  DiscoverFacets,
} from '@whimbrel/actor'
import { makeTreeFixture } from '@whimbrel-test/tree-fixtures'
import { DefaultFacetRegistry } from '@whimbrel/facet'
import { ExecutionStepBlueprint, newStepResult } from '@whimbrel/core-api'
import { generateExecutionStep } from '@src/plan/materialize'
import { DiskFileSystem } from '@whimbrel/filesystem'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

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

  describe('materializePlan', () => {
    it('should create an execution plan and attach augmented steps for SOURCE__DEFINE', async () => {
      // Given
      const ctx = await makeWhimbrelContext({
        facets: new DefaultFacetRegistry([SourceFacet, ActorFacet]),
      })
      const rootDir = await createDirectory([['my-source', []]])
      const sourceDir = path.join(rootDir, 'my-source')
      const blueprint = makeAnalyzeScaffold(sourceDir)

      // When
      const plan = await materializePlan(ctx, blueprint)

      // Then
      expect(plan).toEqual({
        steps: [
          expect.objectContaining({
            id: `my-source:${SOURCE__DEFINE}`,
            bind: {
              source: 'my-source',
              key: 'source',
            },
            inputs: {
              source: {
                path: sourceDir,
              },
            },
            expectedResult: {
              mutations: {
                fs: [],
                vcs: [],
                ctx: [
                  {
                    mutationType: 'ctx',
                    type: 'add',
                    path: 'sources',
                    key: 'my-source',
                  },
                  {
                    mutationType: 'ctx',
                    type: 'set',
                    path: 'source',
                    key: 'my-source',
                  },
                ],
              },
              journal: [],
            },
            steps: [
              expect.objectContaining({
                id: `my-source:${ACTOR__ANALYZE}`,
                bind: {
                  source: 'my-source',
                  key: 'source',
                },
                inputs: {
                  actor: {
                    ref: 'source',
                  },
                },
                steps: [
                  expect.objectContaining({
                    id: `my-source:${ACTOR__DISCOVER_FACETS}`,
                    parameters: DiscoverFacets.parameters,
                    bind: {
                      source: 'my-source',
                      key: 'source',
                    },
                    inputs: {},
                  }),
                ],
              }),
              expect.objectContaining({
                id: `my-source:${ACTOR__REIFY}`,
                bind: {
                  source: 'my-source',
                  key: 'source',
                },
                inputs: {
                  actor: {
                    ref: 'source',
                  },
                },
                steps: [],
              }),
            ],
          }),
        ],
      })
    })

    it('should create an execution plan and attach augmented steps for TARGET__DEFINE', async () => {
      // Given
      const ctx = await makeWhimbrelContext({
        facets: new DefaultFacetRegistry([TargetFacet, ActorFacet]),
      })
      const rootDir = await createDirectory([['my-target', []]])
      const targetDir = path.join(rootDir, 'my-target')
      const blueprint = makeAnalyzeScaffold(targetDir, 'target')

      // When
      const plan = await materializePlan(ctx, blueprint)

      // Then
      expect(plan).toEqual({
        steps: [
          expect.objectContaining({
            id: `my-target:${TARGET__DEFINE}`,
            bind: {
              target: 'my-target',
              key: 'target',
            },
            inputs: {
              target: {
                path: targetDir,
              },
            },
            steps: [
              expect.objectContaining({
                id: `my-target:${ACTOR__ANALYZE}`,
                bind: {
                  target: 'my-target',
                  key: 'target',
                },
                inputs: {
                  actor: {
                    ref: 'target',
                  },
                },
                steps: [
                  expect.objectContaining({
                    id: `my-target:${ACTOR__DISCOVER_FACETS}`,
                    parameters: DiscoverFacets.parameters,
                    bind: {
                      target: 'my-target',
                      key: 'target',
                    },
                    inputs: {},
                  }),
                ],
              }),
              expect.objectContaining({
                id: `my-target:${ACTOR__REIFY}`,
                bind: {
                  target: 'my-target',
                  key: 'target',
                },
                inputs: {
                  actor: {
                    ref: 'target',
                  },
                },
                steps: [],
              }),
            ],
          }),
        ],
      })
    })
  })
})
