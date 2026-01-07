import path from 'node:path'
import { describe, it, expect } from 'vitest'

import {
  inferPreparationSteps,
  makeTask,
  makeWhimbrelContext,
  materializePlan,
} from '@src/index'
import { makeAnalyzeScaffold } from '@src/index'
import ProjectFacet, { PROJECT__EACH_SUBMODULE } from '@whimbrel/project'
import SourceFacet, { SOURCE__DEFINE } from '@whimbrel/source'
import TargetFacet, { TARGET__DEFINE } from '@whimbrel/target'
import ActorFacet, {
  ACTOR__ANALYZE,
  ACTOR__DISCOVER_FACETS,
  ACTOR__REIFY,
  DiscoverFacets,
} from '@whimbrel/actor'
import { makeTreeFixture } from '@whimbrel-test/tree-fixtures'
import { DefaultFacetRegistry } from '@whimbrel/facet'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { FakeProjectFacet, testFacetBuilder, toArrayTree } from './fixtures'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('materialize', () => {
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
        fsMode: 'r',
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
        fsMode: 'r',
        steps: [
          expect.objectContaining({
            id: `my-target:${TARGET__DEFINE}`,
            bind: {
              target: 'my-target',
              key: 'target',
            },
            inputs: {
              isRoot: true,
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

    it('should not re-apply augmentation after input actor submodules have been discovered', async () => {
      // Given
      const rootDir = await createDirectory([
        [
          'mono-root',
          [
            { 'fake-project.json': { isRoot: true } },
            ['frontend', [{ 'fake-project.json': { name: 'frontendileinen' } }]],
            ['backend', [{ 'fake-project.json': { name: 'backendileinen' } }]],
          ],
        ],
      ])

      const ctx = await makeWhimbrelContext({
        cwd: path.join(rootDir, 'mono-root'),
        facets: new DefaultFacetRegistry([
          FakeProjectFacet,
          ProjectFacet,
          SourceFacet,
          TargetFacet,
          ActorFacet,
          testFacetBuilder('dummy')
            .tasks(
              makeTask({
                id: 'dummy:do-nested-things',
                parameters: {
                  target: {
                    type: 'actor',
                    required: true,
                    defaults: [{ ref: 'target' }],
                  },
                },
              }),
              makeTask({
                id: 'dummy:für-alle',
                parameters: {
                  target: {
                    type: 'actor',
                    required: true,
                    defaults: [{ ref: 'target' }],
                  },
                },
              }),
              'even-more-nested'
            )
            .augmentationFor('dummy:do-nested-things', (b) =>
              b.bindActor('target').attach('dummy:für-alle', {
                type: PROJECT__EACH_SUBMODULE,
                inputs: {
                  task: {
                    type: 'dummy:even-more-nested',
                  },
                  inputs: {},
                },
                parameters: {
                  target: {
                    type: 'actor',
                    required: true,
                    defaults: [{ ref: 'target' }],
                  },
                },
              })
            )
            .augmentationFor('dummy:even-more-nested', (b) => b.attach('dummy:für-alle'))
            .build(),
        ]),
      })

      const task = ctx.facets.lookupTask('dummy:do-nested-things')

      const blueprint = {
        steps: [
          ...inferPreparationSteps(ctx, task),
          {
            type: task.id,
            inputs: {},
          },
        ],
      }

      // When
      const plan = await materializePlan(ctx, blueprint)

      // Then
      expect(toArrayTree(plan.steps)).toEqual([
        [
          'mono-root:target:define',
          [
            'mono-root:actor:analyze',
            ['mono-root:actor:discover-facets'],
            [
              'mono-root:project:define-submodules',
              [
                'backend:target:define',

                ['backend:actor:analyze', ['backend:actor:discover-facets']],
                ['backend:actor:reify'],
              ],
              [
                'frontend:target:define',
                ['frontend:actor:analyze', ['frontend:actor:discover-facets']],
                ['frontend:actor:reify'],
              ],
            ],
          ],
          ['mono-root:actor:reify'],
        ],
        [
          'dummy:do-nested-things',
          ['mono-root:dummy:für-alle'],
          [
            'mono-root:project:each-submodule',
            ['backend:dummy:even-more-nested', ['backend:dummy:für-alle']],
            ['frontend:dummy:even-more-nested', ['frontend:dummy:für-alle']],
          ],
        ],
      ])
    })
  })
})
