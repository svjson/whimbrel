import { describe, expect, test } from 'vitest'
import path from 'node:path'

import { GIT__IMPORT, Import } from '@src/index'

import { stepExecutionFixture } from '@whimbrel-test/step-execution-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { makeActor } from '@whimbrel/core-api'

const { stepExecutionTest } = stepExecutionFixture({ describe, expect, test })

const { createDirectory, prepareGitRepository } = makeTreeFixture(DiskFileSystem)

describe(GIT__IMPORT, () => {
  stepExecutionTest({
    test: 'should import todo-service into ./packages of acme-platform',

    before: async () => {
      const rootPath = await createDirectory([['projects', []]])
      const projectsPath = path.join(rootPath, 'projects')

      return {
        rootPath,
        projectsPath,
        todoServicePath: await prepareGitRepository(DiskFileSystem, 'todo-service', {
          root: projectsPath,
          repoDir: 'todo-service',
        }),
        monorepoRoot: await prepareGitRepository(DiskFileSystem, 'acme-platform', {
          root: projectsPath,
          repoDir: 'acme-platform',
        }),
      }
    },

    defineStep: ({ todoServicePath, monorepoRoot }) => {
      return {
        id: Import.id,
        inputs: {
          from: todoServicePath,
          to: path.join(monorepoRoot, 'packages', 'todo-service'),
          source: makeActor({
            id: 'todo-service',
            name: 'todo-service',
            root: todoServicePath,
          }),
          target: makeActor({
            id: 'acme-platform',
            name: 'acme-platform',
            root: monorepoRoot,
          }),
        },
        task: Import,
      }
    },

    then: async ({ ctx, monorepoRoot }) => {
      expect(
        await ctx.disk.exists(path.join(monorepoRoot, 'packages', 'todo-service'))
      ).toBe(true)
    },
  })
})
