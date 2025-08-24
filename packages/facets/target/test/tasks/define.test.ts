import path from 'node:path'
import { describe, expect, test } from 'vitest'

import Define, { TARGET__DEFINE } from '@src/tasks/define'
import { stepExecutionFixture } from '@whimbrel-test/step-execution-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'

const { stepExecutionTest } = stepExecutionFixture({ describe, expect, test })
const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe(TARGET__DEFINE, () => {
  stepExecutionTest({
    test: 'should define and initialize target from path',

    before: async () => {
      return {
        rootPath: await createDirectory([['my-project', []]]),
      }
    },

    defineStep: ({ rootPath }) => {
      return {
        id: Define.id,
        inputs: {
          target: {
            path: path.join(rootPath, 'my-project'),
          },
        },
        task: Define,
      }
    },

    then: ({ ctx, rootPath }) => {
      expect(ctx.target).toBeDefined()
      expect(Object.keys(ctx.targets)).toEqual([ctx.target.id])

      expect(ctx.target).toEqual({
        id: 'my-project',
        name: 'my-project',
        root: path.join(rootPath, 'my-project'),
        meta: {},
        facets: {},
      })
    },
  })
})
