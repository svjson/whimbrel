import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { describe, expect, it } from 'vitest'
import { PackageJSON } from '@src/index'
import path from 'node:path'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('PackageJSON', () => {
  describe('read', () => {
    it('should read package.json from absolute path', async () => {
      // Given
      const ctx = await memFsContext()
      const dir = await createDirectory(
        [
          {
            'package.json': {
              name: 'the-package',
              version: '0.1.0',
            },
          },
        ],
        ctx.disk
      )

      // When
      const pkgJson = await PackageJSON.read(ctx.disk, path.join(dir, 'package.json'))

      // Then
      expect(pkgJson.getContent()).toEqual({
        name: 'the-package',
        version: '0.1.0',
      })
    })

    it('should read package.json from absolute path parts', async () => {
      // Given
      const ctx = await memFsContext()
      const dir = await createDirectory(
        [
          {
            'package.json': {
              name: 'the-package',
              version: '0.1.0',
            },
          },
        ],
        ctx.disk
      )

      // When
      const pkgJson = await PackageJSON.read(ctx.disk, [dir, 'package.json'])

      // Then
      expect(pkgJson.getContent()).toEqual({
        name: 'the-package',
        version: '0.1.0',
      })
    })
  })
})
