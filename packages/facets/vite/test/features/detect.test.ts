import { describe, expect, it } from 'vitest'
import path from 'node:path'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
const { createDirectory } = makeTreeFixture(DiskFileSystem)
import { PackageJSON } from '@whimbrel/package-json'

import { detect } from '@src/features/detect'

describe('detect', () => {
  it('should not detect vite when package.json does not list vite as dependency', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(['tsconfig.json'], ctx.disk)
    const pkgJson = new PackageJSON({
      storage: ctx.disk,
      path: path.join(root, 'package.json'),
      content: {
        name: 'my-project',
        dependencies: {
          koa: '8.0.0',
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
})
