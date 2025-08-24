import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { RemoveScript, PACKAGE_JSON__REMOVE_SCRIPT } from '@src/tasks/remove-script'
import { stepExecutionFixture } from '@whimbrel-test/step-execution-fixtures'
import { createDirectory, populateDirectory } from '@whimbrel-test/tree-fixtures'
import { makeFacetScope } from '@whimbrel/facet'
import { Actor, newStepResult } from '@whimbrel/core-api'

const { stepExecutionTest } = stepExecutionFixture({ describe, expect, test })

describe(PACKAGE_JSON__REMOVE_SCRIPT, () => {
  const commonProps = {
    before: async () => {
      const rootPath = await createDirectory([])
      return {
        rootPath,
        actor: {
          id: 'my-project',
          name: 'my-project',
          root: rootPath,
          facets: {
            'package.json': makeFacetScope(),
          },
          meta: {},
        } satisfies Actor,
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
    test: 'should remove script from package.json when both name and script matches inputs',

    ...commonProps,

    defineStep: ({ actor }) => {
      return {
        id: RemoveScript.id,
        inputs: {
          target: actor,
          name: 'clean',
          script: 'rimraf ./dist',
        },
        task: RemoveScript,
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
        },
      })
    },
  })

  stepExecutionTest({
    test: 'should remove script from package.json when only name is supplied',

    ...commonProps,

    defineStep: ({ actor }) => {
      return {
        id: RemoveScript.id,
        inputs: {
          target: actor,
          name: 'clean',
        },
        task: RemoveScript,
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
        },
      })
    },
  })

  stepExecutionTest({
    test: 'should not remove script from package.json if script is supplied but does not match',

    ...commonProps,

    defineStep: ({ actor }) => {
      return {
        id: RemoveScript.id,
        inputs: {
          target: actor,
          name: 'clean',
          script: 'bleep-bloop',
        },
        task: RemoveScript,
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
