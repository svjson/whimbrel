import path from 'node:path'
import { describe, expect, test } from 'vitest'
import licenses from 'spdx-license-list/full.js'

import { CreateFile, LICENSE__CREATE_FILE } from '@src/tasks/create-file'
import { stepExecutionFixture } from '@whimbrel-test/step-execution-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { makeFacetScope } from '@whimbrel/facet'
import NodeJSFacet from '@whimbrel/node'
import PackageJsonFacet from '@whimbrel/package-json'
import LicenseFacet from '@src/index'
import { makeActor, newStepResult } from '@whimbrel/core-api'

const { stepExecutionTest } = stepExecutionFixture({ describe, expect, test })
const { createDirectory, populateDirectory } = makeTreeFixture(DiskFileSystem)

describe(LICENSE__CREATE_FILE, () => {
  stepExecutionTest({
    test: 'Should create a license file according to project metadata',

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
            'package.json': makeFacetScope(),
          },
          meta: {},
        }),
      }
    },

    defineStep: ({ actor }) => {
      return {
        id: CreateFile.id,
        bind: {
          target: actor.id,
          key: 'target',
        },
        inputs: {
          target: actor,
        },
        task: CreateFile,
      }
    },

    prepareContext: ({ ctx, actor }) => {
      ctx.targets[actor.id] = actor
      ctx.facets.register(PackageJsonFacet)
      ctx.facets.register(LicenseFacet)
      ctx.facets.register(NodeJSFacet)
      ctx.stepResult = newStepResult()
    },

    given: async ({ ctx, rootPath }) => {
      await populateDirectory(
        rootPath,
        [{ 'package.json': { author: 'Konny Kruka', license: 'ISC' } }],
        ctx.disk
      )
    },

    then: async ({ ctx, rootPath }) => {
      const filePath = path.join(rootPath, 'LICENSE')
      expect(await ctx.disk.exists(filePath)).toBe(true)

      expect(ctx.stepResult).toEqual({
        journal: [
          {
            origin: 'flow',
            type: 'let',
            payload: {
              name: 'spdx',
              value: 'ISC',
            },
            private: false,
          },
          {
            origin: 'flow',
            type: 'let',
            payload: {
              name: 'year',
              value: '2025',
            },
            private: false,
          },
          {
            origin: 'flow',
            type: 'let',
            payload: {
              name: 'author',
              value: 'Konny Kruka',
            },
            private: false,
          },
          {
            origin: 'flow',
            type: 'let',
            payload: {
              name: 'copyright-holder',
              value: 'Konny Kruka',
            },
            private: false,
          },
          {
            origin: 'flow',
            type: 'let',
            payload: {
              name: 'owner',
              value: 'Konny Kruka',
            },
            private: false,
          },
        ],
        mutations: {
          vcs: [],
          ctx: [],
          fs: [
            {
              mutationType: 'fs',
              object: 'file',
              path: path.join(rootPath, 'LICENSE'),
              type: 'create',
            },
          ],
        },
      })

      expect((await ctx.disk.read(filePath, 'utf8')) as string).toEqual(
        licenses.ISC.licenseText
      )
    },
  })
})
