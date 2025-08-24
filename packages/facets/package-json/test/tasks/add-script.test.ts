import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { AddScript, PACKAGE_JSON__ADD_SCRIPT } from '@src/tasks/add-script'
import { stepExecutionFixture } from '@whimbrel-test/step-execution-fixtures'
import { createDirectory, populateDirectory } from '@whimbrel-test/tree-fixtures'
import { makeFacetScope } from '@whimbrel/facet'
import { Actor, newStepResult } from '@whimbrel/core-api'

const { stepExecutionTest } = stepExecutionFixture({ describe, expect, test })

describe(PACKAGE_JSON__ADD_SCRIPT, () => {
  stepExecutionTest({
    test: 'should write script to package.json',

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

    defineStep: ({ actor }) => {
      return {
        id: AddScript.id,
        inputs: {
          actor,
          name: 'clean',
          script: 'rimraf ./dist',
        },
        task: AddScript,
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
          clean: 'rimraf ./dist',
        },
      })
    },
  })
})
