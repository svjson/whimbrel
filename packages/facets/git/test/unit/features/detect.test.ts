import { describe, expect, it } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'

import { detect } from '@src/features/detect'

const { createDirectory, prepareGitRepository } = makeTreeFixture(DiskFileSystem)

describe('detect', () => {
  it('should not detect git when target folder is not a git repository', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(['package.json'], ctx.disk)

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(false)
  })

  it('should detect git repository with commits', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await prepareGitRepository(ctx.disk, 'todo-service')

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult).toEqual({
      detected: true,
      facet: {
        scope: {
          roles: ['version-control'],
          config: {
            root,
          },
        },
      },
    })
  })
})
