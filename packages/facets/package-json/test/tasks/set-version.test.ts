import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { stepExecutionFixture } from '@whimbrel-test/step-execution-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { makeFacetScope } from '@whimbrel/facet'
import { makeActor, newStepResult } from '@whimbrel/core-api'
import { DiskFileSystem } from '@whimbrel/filesystem'

import { SetVersion, PACKAGE_JSON__SET_VERSION } from '@src/tasks/set-version'
import { PackageJSON } from '@src/index'

const { createDirectory, populateDirectory } = makeTreeFixture(DiskFileSystem)
const { stepExecutionTest } = stepExecutionFixture({ describe, expect, test })

describe(PACKAGE_JSON__SET_VERSION, () => {
  stepExecutionTest({
    test: 'should update target package version',

    before: async () => {
      const rootPath = await createDirectory([])
      return {
        rootPath,
        actor: makeActor({
          id: 'my-project',
          root: rootPath,
          facets: {
            'package.json': makeFacetScope(),
          },
        }),
      }
    },

    defineStep: ({ actor }) => {
      return {
        id: SetVersion.id,
        inputs: {
          target: actor,
          version: '0.1.1',
        },
        task: SetVersion,
      }
    },

    prepareContext: ({ ctx, actor }) => {
      ctx.targets[actor.id] = actor
      ctx.stepResult = newStepResult()
    },

    given: async ({ ctx, rootPath }) => {
      await populateDirectory(
        rootPath,
        [{ 'package.json': { name: 'my-project', version: '0.1.0' } }],
        ctx.disk
      )
    },

    then: async ({ ctx, rootPath }) => {
      const pkgJson = await PackageJSON.readIfExists(ctx.disk, rootPath)
      expect(pkgJson).toBeInstanceOf(PackageJSON)

      expect(ctx.stepResult).toEqual({
        journal: [],
        mutations: {
          vcs: [],
          ctx: [],
          fs: [
            {
              mutationType: 'fs',
              object: 'file',
              path: path.join(rootPath, 'package.json'),
              type: 'modify',
            },
          ],
        },
      })

      expect(pkgJson.getContent()).toEqual({
        name: 'my-project',
        version: '0.1.1',
      })
    },
  })

  stepExecutionTest({
    test: 'should update target package version and references in workspace',

    before: async () => {
      const rootPath = await createDirectory([])
      return {
        rootPath,
        actors: {
          myProject: makeActor({
            id: 'my-project',
            root: rootPath,
            facets: {
              'package.json': makeFacetScope(),
            },
            subModules: ['submodule-a', 'submodule-b'],
          }),
          moduleA: makeActor({
            id: 'submodule-a',
            root: path.join(rootPath, 'packages', 'submodule-a'),
            facets: {
              'package.json': makeFacetScope(),
            },
          }),
          moduleB: makeActor({
            id: 'submodule-b',
            root: path.join(rootPath, 'packages', 'submodule-b'),
            facets: {
              'package.json': makeFacetScope(),
            },
          }),
        },
      }
    },

    defineStep: ({ actors }) => {
      return {
        id: SetVersion.id,
        inputs: {
          target: actors.moduleA,
          version: '0.1.5',
          internalDeps: true,
        },
        task: SetVersion,
      }
    },

    prepareContext: ({ ctx, actors }) => {
      ctx.targets[actors.myProject.id] = actors.myProject
      ctx.targets[actors.moduleA.id] = actors.moduleA
      ctx.targets[actors.moduleB.id] = actors.moduleB
      ctx.stepResult = newStepResult()
    },

    given: async ({ ctx, rootPath }) => {
      await populateDirectory(
        rootPath,
        [
          { 'package.json': { name: 'my-project', version: '0.1.0' } },
          [
            'packages',
            [
              [
                'submodule-a',
                [{ 'package.json': { name: 'submodule-a', version: '0.1.4' } }],
              ],
              [
                'submodule-b',
                [
                  {
                    'package.json': {
                      name: 'submodule-b',
                      version: '0.1.5',
                      peerDependencies: {
                        'submodule-a': '^0.1.4',
                      },
                      devDependencies: {
                        'submodule-a': '^0.1.4',
                        vitest: '^3.2.4',
                        '@types/node': '^24.3.0',
                        vite: '^7.1.2',
                      },
                    },
                  },
                ],
              ],
            ],
          ],
        ],
        ctx.disk
      )
    },

    then: async ({ ctx, actors, rootPath }) => {
      const rootPkgJson = await PackageJSON.readIfExists(ctx.disk, rootPath)
      const moduleAJson = await PackageJSON.readIfExists(ctx.disk, actors.moduleA.root)
      const moduleBJson = await PackageJSON.readIfExists(ctx.disk, actors.moduleB.root)

      expect(rootPkgJson).toBeInstanceOf(PackageJSON)
      expect(moduleAJson).toBeInstanceOf(PackageJSON)
      expect(moduleBJson).toBeInstanceOf(PackageJSON)

      expect(ctx.stepResult).toEqual({
        journal: [],
        mutations: {
          vcs: [],
          ctx: [],
          fs: [
            {
              mutationType: 'fs',
              object: 'file',
              path: moduleAJson.getPath(),
              type: 'modify',
            },
            {
              mutationType: 'fs',
              object: 'file',
              path: moduleBJson.getPath(),
              type: 'modify',
            },
          ],
        },
      })

      expect(rootPkgJson.getContent()).toEqual({
        name: 'my-project',
        version: '0.1.0',
      })
      expect(moduleAJson.getContent()).toEqual({
        name: 'submodule-a',
        version: '0.1.5',
      })
      expect(moduleBJson.getContent()).toEqual({
        name: 'submodule-b',
        version: '0.1.5',
        peerDependencies: {
          'submodule-a': '^0.1.5',
        },
        devDependencies: {
          'submodule-a': '^0.1.5',
          vitest: '^3.2.4',
          '@types/node': '^24.3.0',
          vite: '^7.1.2',
        },
      })
    },
  })
})
