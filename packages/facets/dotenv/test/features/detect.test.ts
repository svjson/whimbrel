import { describe, expect, it } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'

import { detect } from '@src/features/detect'
import { DiskFileSystem } from '@whimbrel/filesystem'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

const ROOT_DIR_FILES = ['package.json', 'tsconfig.json', 'tsup.config.ts']

const SRC_DIR = [
  'src',
  [
    {
      'index.ts': {},
    },
  ],
]

describe('detect', () => {
  it('should not detect the dotenv facet when there are on .env(.*) files', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory([...ROOT_DIR_FILES, SRC_DIR], ctx.disk)

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(false)
  })

  it('should detect the dotenv facet and identify single .env file', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory([...ROOT_DIR_FILES, '.env', SRC_DIR], ctx.disk)

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(true)
    expect(detectionResult).toEqual({
      detected: true,
      facet: {
        scope: {
          roles: ['config-provider'],
          config: {
            rootDir: root,
            files: ['.env'],
          },
        },
      },
    })
  })

  it('should detect the dotenv facet and identify .env file variants', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [...ROOT_DIR_FILES, '.env', '.env.template', '.env.local', SRC_DIR],
      ctx.disk
    )

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(true)
    expect(detectionResult).toEqual({
      detected: true,
      facet: {
        scope: {
          roles: ['config-provider'],
          config: {
            rootDir: root,
            files: ['.env', '.env.template', '.env.local'],
          },
        },
      },
    })
  })

  it('should detect only .env(.*) in scan dir root', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [...ROOT_DIR_FILES, '.env.template', SRC_DIR, ['dist', ['.env', '.env.example']]],
      ctx.disk
    )

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(true)
    expect(detectionResult).toEqual({
      detected: true,
      facet: {
        scope: {
          roles: ['config-provider'],
          config: {
            rootDir: root,
            files: ['.env.template'],
          },
        },
      },
    })
  })
})
