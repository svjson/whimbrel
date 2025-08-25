import { describe, expect, it } from 'vitest'

import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { detect } from '@src/features/detect'
import { DiskFileSystem } from '@whimbrel/filesystem'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('detect', () => {
  it('should detect pnpm if specified as packageManager in package.json', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [
        {
          'package.json': {
            packageManager: 'pnpm@10.12.3',
          },
        },
      ],
      ctx.disk
    )

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult).toEqual({
      detected: true,
      facet: {
        scope: {
          roles: ['pkg-manager'],
          config: {},
        },
      },
    })
  })

  it('should detect pnpm if specified in engines in package.json', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [
        {
          'package.json': {
            engines: {
              pnpm: '10.12.3',
            },
          },
        },
      ],
      ctx.disk
    )

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult).toEqual({
      detected: true,
      facet: {
        scope: {
          roles: ['pkg-manager'],
          config: {},
        },
      },
    })
  })
})
