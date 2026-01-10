import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { stepExecutionFixture } from '@whimbrel-test/step-execution-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'

import { makeFacetScope } from '@whimbrel/facet'
import { makeActor, newStepResult } from '@whimbrel/core-api'
import { RenameScript, PACKAGE_JSON__RENAME_SCRIPT } from '@src/index'

const { stepExecutionTest } = stepExecutionFixture({ describe, expect, test })
const { createDirectory, populateDirectory } = makeTreeFixture(DiskFileSystem)

describe(PACKAGE_JSON__RENAME_SCRIPT, () => {
  const commonProps = {
    before: async () => {
      const rootPath = await createDirectory([])
      return {
        rootPath,
        actor: makeActor({
          id: 'my-project',
          name: 'my-project',
          root: rootPath,
          facets: {
            'package.json': makeFacetScope(),
          },
          meta: {},
        }),
      }
    },

    prepareContext: ({ ctx, actor }) => {
      ctx.targets[actor.id] = actor
      ctx.stepResult = newStepResult()
    },

    given: async ({ ctx, rootPath }) => {
      await populateDirectory(
        rootPath,
        [
          {
            'package.json': {
              name: 'my-project',
              version: '0.1.0',
              scripts: {
                build: 'tsup',
                clean: 'rimraf ./dist',
              },
            },
          },
        ],
        ctx.disk
      )
    },
  }

  stepExecutionTest({
    test: 'should rename script in package.json according to inputs `from` and `to`',

    ...commonProps,

    defineStep: ({ actor }) => {
      return {
        id: RenameScript.id,
        inputs: {
          target: actor,
          from: 'clean',
          to: 'build:clean',
        },
        task: RenameScript,
      }
    },

    then: async ({ ctx, rootPath }) => {
      const pkgJsonPath = path.join(rootPath, 'package.json')
      expect(await ctx.disk.exists(pkgJsonPath)).toBe(true)

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

      expect(await ctx.disk.readJson(pkgJsonPath)).toEqual({
        name: 'my-project',
        version: '0.1.0',
        scripts: {
          build: 'tsup',
          'build:clean': 'rimraf ./dist',
        },
      })
    },
  })

  stepExecutionTest({
    test: 'should not modify package.json if the from/source script is not present',

    ...commonProps,

    defineStep: ({ actor }) => {
      return {
        id: RenameScript.id,
        inputs: {
          target: actor,
          from: 'dev',
          to: 'dev:launch',
        },
        task: RenameScript,
      }
    },

    then: async ({ ctx, rootPath }) => {
      const pkgJsonPath = path.join(rootPath, 'package.json')
      expect(await ctx.disk.exists(pkgJsonPath)).toBe(true)

      expect(ctx.stepResult).toEqual({
        journal: [],
        mutations: {
          vcs: [],
          ctx: [],
          fs: [],
        },
      })

      expect(await ctx.disk.readJson(pkgJsonPath)).toEqual({
        name: 'my-project',
        version: '0.1.0',
        scripts: {
          build: 'tsup',
          clean: 'rimraf ./dist',
        },
      })
    },
  })
})
