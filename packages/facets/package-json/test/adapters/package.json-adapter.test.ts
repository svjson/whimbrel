import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { describe, expect, it } from 'vitest'
import { PackageJSON } from '@src/index'
import path from 'node:path'
import { FileSystem } from '@whimbrel/core-api'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('PackageJSON', () => {
  describe('read and write', () => {
    it('should read file from storage and write changes', async () => {
      // Given
      const ctx = await memFsContext()
      const dirRoot = await createDirectory(
        [
          {
            'package.json': {
              name: 'some-package',
              version: '0.1.0',
            },
          },
        ],
        ctx.disk
      )

      const pkgJson = await PackageJSON.read(ctx.disk, dirRoot)

      // When
      pkgJson.set('type', 'module')
      await pkgJson.write()

      // Then
      expect(await ctx.disk.readJson(path.join(dirRoot, 'package.json'))).toEqual({
        name: 'some-package',
        version: '0.1.0',
        type: 'module',
      })
    })
  })

  describe('hasDependency', () => {
    it('should find dependencies listed in dependencies and devDependencies', () => {
      // Given
      const pkgJson = new PackageJSON({
        path: 'package.json',
        storage: {} as FileSystem,
        content: {
          dependencies: {
            'fast-deep-equal': '^3.1.3',
          },
          devDependencies: {
            '@types/node': '^24.3.0',
            vite: '^7.1.2',
          },
        },
      })

      // Then
      expect(pkgJson.hasDependency('fast-deep-equal')).toBe(true)
      expect(pkgJson.hasDependency('@types/node')).toBe(true)
      expect(pkgJson.hasDependency('vite')).toBe(true)

      expect(pkgJson.hasDependency('ts-node')).toBe(false)
      expect(pkgJson.hasDependency('@whimbrel/walk')).toBe(false)
      expect(pkgJson.hasDependency('express')).toBe(false)
    })

    it('should find dependencies listed in peerDependencies', () => {
      // Given
      const pkgJson = new PackageJSON({
        path: 'package.json',
        storage: {} as FileSystem,
        content: {
          peerDependencies: {
            'fast-deep-equal': '^3.1.3',
            '@whimbrel/walk': '^0.1.3',
          },
        },
      })

      // Then
      expect(pkgJson.hasDependency('fast-deep-equal')).toBe(true)
      expect(pkgJson.hasDependency('@whimbrel/walk')).toBe(true)

      expect(pkgJson.hasDependency('@types/node')).toBe(false)
      expect(pkgJson.hasDependency('vite')).toBe(false)
      expect(pkgJson.hasDependency('ts-node')).toBe(false)
      expect(pkgJson.hasDependency('express')).toBe(false)
    })
  })

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

    it('should read package.json from absolute path, omitting file name', async () => {
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
      const pkgJson = await PackageJSON.read(ctx.disk, dir)

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

    it('should read package.json from absolute path parts, omitting file name', async () => {
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
      const pkgJson = await PackageJSON.read(ctx.disk, ['/tmp', path.basename(dir)])

      // Then
      expect(pkgJson.getContent()).toEqual({
        name: 'the-package',
        version: '0.1.0',
      })
    })
  })

  describe('updateDependency', () => {
    it('should update dependency and keep semantics in `dependencies`', () => {
      // Given
      const pkgJson = new PackageJSON({
        content: {
          dependencies: {
            'my-lib': '^5.8.3',
          },
        },
      })

      // When
      const updatedp = pkgJson.updateDependency('my-lib', '6.0.0')

      // Then
      expect(updatedp).toBe(true)
      expect(pkgJson.getContent()).toEqual({
        dependencies: {
          'my-lib': '^6.0.0',
        },
      })
    })

    it('should update dependency and keep semantics in both `peerDependencies` and `devDependencies`', () => {
      // Given
      const pkgJson = new PackageJSON({
        content: {
          devDependencies: {
            'my-lib': '^5.8.3',
          },
          peerDependencies: {
            'my-lib': '^5.8.3',
          },
        },
      })

      // When
      const updatedp = pkgJson.updateDependency('my-lib', '6.0.0')

      // Then
      expect(updatedp).toBe(true)
      expect(pkgJson.getContent()).toEqual({
        devDependencies: {
          'my-lib': '^6.0.0',
        },
        peerDependencies: {
          'my-lib': '^6.0.0',
        },
      })
    })

    it('should do nothing if dependency is not present in package.json', () => {
      // Given
      const pkgJson = new PackageJSON({
        content: {
          devDependencies: {
            'my-lib': '^5.8.3',
          },
          peerDependencies: {
            'my-lib': '^5.8.3',
          },
        },
      })

      // When
      const updatedp = pkgJson.updateDependency('other-lib', '6.0.0')

      // Then
      expect(updatedp).toBe(false)
      expect(pkgJson.getContent()).toEqual({
        devDependencies: {
          'my-lib': '^5.8.3',
        },
        peerDependencies: {
          'my-lib': '^5.8.3',
        },
      })
    })
  })
})
