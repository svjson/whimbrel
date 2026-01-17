import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { Create, GITIGNORE__CREATE } from '@src/tasks/create'
import { stepExecutionFixture } from '@whimbrel-test/step-execution-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { makeFacetScope } from '@whimbrel/facet'
import NodeFacet from '@whimbrel/node'
import TsConfigFacet from '@whimbrel/tsconfig-json'
import { makeActor, newStepResult } from '@whimbrel/core-api'

const { stepExecutionTest } = stepExecutionFixture({ describe, expect, test })
const { createDirectory, populateDirectory } = makeTreeFixture(DiskFileSystem)

describe(GITIGNORE__CREATE, () => {
  stepExecutionTest({
    test: 'should define and initialize source from path',

    before: async () => {
      const rootPath = await createDirectory([])
      return {
        rootPath,
        actor: makeActor({
          id: 'my-project',
          name: 'my-project',
          root: rootPath,
          facets: {
            node: makeFacetScope(),
            'tsconfig.json': makeFacetScope(),
          },
          meta: {},
        }),
      }
    },

    defineStep: ({ actor }) => {
      return {
        id: Create.id,
        inputs: {
          actor,
        },
        task: Create,
      }
    },

    prepareContext: ({ ctx, actor }) => {
      ctx.targets[actor.id] = actor
      ctx.facets.register(NodeFacet)
      ctx.facets.register(TsConfigFacet)
      ctx.stepResult = newStepResult()
    },

    given: async ({ ctx, rootPath }) => {
      await populateDirectory(
        rootPath,
        [{ 'tsconfig.json': { compilerOptions: { outDir: 'dist' } } }],
        ctx.disk
      )
    },

    then: async ({ ctx, rootPath }) => {
      const gitIgnorePath = path.join(rootPath, '.gitignore')
      expect(await ctx.disk.exists(gitIgnorePath)).toBe(true)

      expect(ctx.stepResult).toEqual({
        journal: [
          {
            origin: 'flow',
            type: 'let',
            payload: {
              name: 'queryResult',
              value: [
                {
                  source: 'node',
                  result: [
                    { pattern: 'node_modules', groups: ['generated'], source: 'node' },
                  ],
                },
                {
                  source: 'tsconfig.json',
                  result: [
                    { pattern: 'dist/', groups: ['build'], source: 'tsconfig.json' },
                    {
                      pattern: 'tsconfig.tsbuildinfo',
                      groups: ['build'],
                      source: 'tsconfig.json',
                    },
                  ],
                },
              ],
            },
            private: true,
          },
          {
            origin: 'flow',
            type: 'let',
            payload: {
              name: 'contributors',
              value: 'node, tsconfig.json',
            },
            private: false,
          },
          {
            origin: 'flow',
            type: 'let',
            payload: {
              name: 'ignoreFiles',
              value: [
                { pattern: 'node_modules', groups: ['generated'], source: 'node' },
                { pattern: 'dist/', groups: ['build'], source: 'tsconfig.json' },
                {
                  pattern: 'tsconfig.tsbuildinfo',
                  groups: ['build'],
                  source: 'tsconfig.json',
                },
              ],
            },
            private: true,
          },
        ],
        mutations: {
          vcs: [],
          ctx: [],
          fs: [
            {
              mutationType: 'fs',
              object: 'file',
              path: path.join(rootPath, '.gitignore'),
              type: 'create',
            },
          ],
        },
      })

      expect(
        ((await ctx.disk.read(gitIgnorePath, 'utf8')) as string).split('\n')
      ).toEqual([
        '# --- Ignore Files ---',
        'node_modules',
        'dist/',
        'tsconfig.tsbuildinfo',
        '',
      ])
    },
  })
})
