import path from 'node:path'
import { describe, expect, test } from 'vitest'

import Define, { SOURCE__DEFINE } from '@src/tasks/define'
import { stepExecutionFixture } from '@whimbrel-test/step-execution-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { makeActor } from '@whimbrel/core-api'

const { stepExecutionTest } = stepExecutionFixture({ describe, expect, test })
const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe(SOURCE__DEFINE, () => {
  stepExecutionTest({
    test: 'should define and initialize source from path',

    before: async () => {
      return {
        rootPath: await createDirectory([['my-project', []]]),
      }
    },

    defineStep: ({ rootPath }) => {
      return {
        id: Define.id,
        inputs: {
          source: {
            path: path.join(rootPath, 'my-project'),
          },
        },
        task: Define,
      }
    },

    then: ({ ctx, rootPath }) => {
      expect(ctx.source).toBeDefined()
      expect(Object.keys(ctx.sources)).toEqual([ctx.source.id])

      expect(ctx.source).toEqual(
        makeActor({
          id: 'my-project',
          name: 'my-project',
          root: path.join(rootPath, 'my-project'),
          meta: {},
          facets: {},
        })
      )
    },
  })
})
