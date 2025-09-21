import { describe, it, expect, test, beforeAll } from 'vitest'

import {
  DiskFileSystem,
  makeNodeFsPromisesAdapter,
  ReadThroughFileSystem,
} from '@whimbrel/filesystem'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { makeIsoMorphicGitAdapter } from '@whimbrel/git'

const { prepareGitRepository } = makeTreeFixture(DiskFileSystem)

describe('ismorphic-git operations', () => {
  ;[DiskFileSystem, new ReadThroughFileSystem()].forEach((disk) => {
    describe(disk.constructor.name, () => {
      const adapter = makeIsoMorphicGitAdapter(makeNodeFsPromisesAdapter(disk))

      describe('repositoryRoot', () => {
        let repoRoot: string

        beforeAll(async () => {
          repoRoot = await prepareGitRepository(DiskFileSystem, 'todo-service')
        })

        test('from actual repo root', async () => {
          expect(await adapter.repositoryRoot(repoRoot)).toEqual(repoRoot)
        })
      })
    })
  })
})
