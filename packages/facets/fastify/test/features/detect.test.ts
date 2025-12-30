import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
const { createDirectory } = makeTreeFixture(DiskFileSystem)

import { detect } from '@src/features/detect'
import { PackageJSON } from '@whimbrel/package-json'

describe('detect', () => {
  it('should not detect Fastify when no package.json is present', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(['tsconfig.json'])

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(false)
  })

  it('should not detect Fastify when package.json does not list fastify as dependency', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(['tsconfig.json'])
    const pkgJson = new PackageJSON({
      storage: ctx.disk,
      path: path.join(root, 'package.json'),
      content: {
        name: 'my-project',
        dependencies: {
          express: '8.0.0',
          mongodb: '7.0.0',
        },
      },
    })
    await pkgJson.write()

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(false)
  })

  it('should detect Fastify when package.json list fastify as dependency', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(['tsconfig.json'])
    const pkgJson = new PackageJSON({
      storage: ctx.disk,
      path: path.join(root, 'package.json'),
      content: {
        name: 'my-project',
        dependencies: {
          fastify: '8.0.0',
          mongodb: '7.0.0',
        },
      },
    })
    await pkgJson.write()

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult).toEqual({
      detected: true,
      facet: {
        scope: {
          roles: ['http-adapter'],
        },
      },
    })
  })
})
