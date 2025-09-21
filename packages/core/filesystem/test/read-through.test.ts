import { describe, it, expect } from 'vitest'
import { DiskFileSystem, ReadThroughFileSystem } from '@src/index'
import path from 'node:path'

import { makeTreeFixture } from '@whimbrel-test/tree-fixtures'

const { createDirectory, populateDirectory } = makeTreeFixture(DiskFileSystem)

describe('ReadThroughFileSystem', () => {
  describe('copy', () => {
    it('should copy from physical to memory in same folder', async () => {
      // Given
      const dir = await DiskFileSystem.mktmpdir('whim-rt')
      const srcFilePath = path.join(dir, 'testfile')
      DiskFileSystem.write(srcFilePath, 'Once upon a time', 'utf8')
      const rtfs = new ReadThroughFileSystem()

      // When
      const targetFilePath = path.join(dir, 'copiedfile')
      await rtfs.copy(srcFilePath, targetFilePath)

      // Then
      expect(await rtfs.exists(srcFilePath)).toBe(true)
      expect(await rtfs.exists(targetFilePath)).toBe(true)

      expect(await DiskFileSystem.exists(srcFilePath)).toBe(true)
      expect(await DiskFileSystem.exists(targetFilePath)).toBe(false)
    })
  })

  describe('delete', () => {
    it('should mark file not tracked by rtfs as deleted if it exists in physical fs', async () => {
      // Given
      const dir = await DiskFileSystem.mktmpdir('whim-rt')
      const filePath = path.join(dir, 'testfile')
      DiskFileSystem.write(filePath, 'File contents go here', 'utf8')
      const rtfs = new ReadThroughFileSystem()

      // When
      await rtfs.delete(filePath)

      // Then
      expect(await DiskFileSystem.exists(filePath)).toBe(true)
      expect(await rtfs.exists(filePath)).toBe(false)
    })
  })

  describe('exists', () => {
    it('should return true for file that exists on physical file system', async () => {
      // Given
      const dir = await DiskFileSystem.mktmpdir('whim-rt')
      const filePath = path.join(dir, 'testfile')
      DiskFileSystem.write(filePath, 'File contents go here', 'utf8')
      const rtfs = new ReadThroughFileSystem()

      // When
      const existsp = await rtfs.exists(filePath)

      // Then
      expect(existsp).toBe(true)
    })

    it('should return false for file that does not exist on physical file system', async () => {
      // Given
      const rtfs = new ReadThroughFileSystem()

      // Then
      expect(await rtfs.exists('/tmp/krakelibrankelfnatt/klopklop/guran.txt'))
    })
  })

  describe('isDirectory', () => {
    it('should return true for directory that exists on physical file system', async () => {
      // Given
      const rootDir = await DiskFileSystem.mktmpdir('whim-rt')
      const rtfs = new ReadThroughFileSystem()

      // Then
      expect(await rtfs.exists(rootDir)).toBe(true)
    })

    it('should return false for directory that has been removed in MemoryFileSystem', async () => {
      // Given
      const rootDir = await DiskFileSystem.mktmpdir('whim-rt')
      const rtfs = new ReadThroughFileSystem()

      // When
      await rtfs.rmdir(rootDir)

      // Then
      expect(await DiskFileSystem.exists(rootDir)).toBe(true)
      expect(await rtfs.exists(rootDir)).toBe(false)
    })
  })

  describe('ls', () => {
    it('should return all file and directory names of the physical file system by default', async () => {
      // Given
      const dir = await createDirectory([
        'testfile',
        'anotherfile',
        ['a-dir', ['nestedfile']],
      ])
      const rtfs = new ReadThroughFileSystem()

      // When
      const entries = await rtfs.ls(dir)

      // Then
      expect(entries.sort()).toEqual(['a-dir', 'anotherfile', 'testfile'])
    })

    it('should return FileEntry instances for all entries of the physical file system by default', async () => {
      // Given
      const dir = await createDirectory([
        'testfile',
        'anotherfile',
        ['a-dir', ['nestedfile']],
      ])
      const rtfs = new ReadThroughFileSystem()

      // When
      const entries = await rtfs.ls(dir, { withFileTypes: true })

      // Then
      expect(entries.sort((a, b) => a.name.localeCompare(b.name))).toEqual([
        {
          name: 'a-dir',
          path: path.join(dir, 'a-dir'),
          type: 'directory',
        },
        {
          name: 'anotherfile',
          path: path.join(dir, 'anotherfile'),
          type: 'file',
        },
        {
          name: 'testfile',
          path: path.join(dir, 'testfile'),
          type: 'file',
        },
      ])
    })

    it('should not return file name of deleted file', async () => {
      // Given
      const dir = await createDirectory([
        'testfile',
        'anotherfile',
        ['a-dir', ['nestedfile']],
      ])
      const rtfs = new ReadThroughFileSystem()
      await rtfs.delete(path.join(dir, 'anotherfile'))

      // When
      const entries = await rtfs.ls(dir)

      // Then
      expect(entries.sort()).toEqual(['a-dir', 'testfile'])
    })

    it('should return combined entry name result of memory and physical when both exist', async () => {
      const dir = await createDirectory(['package.json', 'tsup.config.ts'])
      const rtfs = new ReadThroughFileSystem()
      await populateDirectory(
        dir,
        ['package.json', 'vite.config.ts', 'tsconfig.json'],
        rtfs
      )

      // When
      const entries = await rtfs.ls(dir)

      // Then
      expect(entries.sort()).toEqual([
        'package.json',
        'tsconfig.json',
        'tsup.config.ts',
        'vite.config.ts',
      ])
    })

    it('should return combined entry result of memory and physical when both exist', async () => {
      const dir = await createDirectory(['package.json', 'tsup.config.ts'])
      const rtfs = new ReadThroughFileSystem()
      await populateDirectory(
        dir,
        ['package.json', 'vite.config.ts', 'tsconfig.json'],
        rtfs
      )

      // When
      const entries = await rtfs.ls(dir, { withFileTypes: true })

      // Then
      expect(entries.sort((a, b) => a.name.localeCompare(b.name))).toEqual([
        {
          name: 'package.json',
          path: path.join(dir, 'package.json'),
          type: 'file',
        },
        {
          name: 'tsconfig.json',
          path: path.join(dir, 'tsconfig.json'),
          type: 'file',
        },
        {
          name: 'tsup.config.ts',
          path: path.join(dir, 'tsup.config.ts'),
          type: 'file',
        },
        {
          name: 'vite.config.ts',
          path: path.join(dir, 'vite.config.ts'),
          type: 'file',
        },
      ])
    })

    it('should return combined entry result of memory and physical when both exist and filter out duplicate references', async () => {
      const dir = await createDirectory([
        'package.json',
        'tsup.config.ts',
        'vite.config.ts',
      ])
      const rtfs = new ReadThroughFileSystem()
      await populateDirectory(dir, ['tsconfig.json'], rtfs)

      const pkgJsonPath = path.join(dir, 'package.json')
      const tsupConfigPath = path.join(dir, 'tsup.config.ts')
      const viteConfigPath = path.join(dir, 'vite.config.ts')
      await rtfs.writeReference(pkgJsonPath, pkgJsonPath)
      await rtfs.writeReference(tsupConfigPath, tsupConfigPath)
      await rtfs.writeReference(viteConfigPath, viteConfigPath)

      // When
      const entries = await rtfs.ls(dir, { withFileTypes: true })

      // Then
      expect(entries.sort((a, b) => a.name.localeCompare(b.name))).toEqual([
        {
          name: 'package.json',
          path: path.join(dir, 'package.json'),
          type: 'file',
        },
        {
          name: 'tsconfig.json',
          path: path.join(dir, 'tsconfig.json'),
          type: 'file',
        },
        {
          name: 'tsup.config.ts',
          path: path.join(dir, 'tsup.config.ts'),
          type: 'file',
        },
        {
          name: 'vite.config.ts',
          path: path.join(dir, 'vite.config.ts'),
          type: 'file',
        },
      ])
    })
  })

  describe('read', () => {
    it('should read file contents from physical file system', async () => {
      // Given
      const dir = await createDirectory([{ testfile: 'A silly little file' }])
      const rtfs = new ReadThroughFileSystem()

      // Then
      expect(await rtfs.read(path.join(dir, 'testfile'), 'utf8')).toEqual(
        'A silly little file'
      )
    })
  })

  describe('scanDir', () => {
    it('should scan physical file system when directory not in memory', async () => {
      // Given
      const dir = await createDirectory([
        'package.json',
        ['src', ['index.js', 'impl.js', 'stuff.js']],
        ['dist', ['index.js', 'index.cjs']],
        'package-lock.json',
      ])
      const rtfs = new ReadThroughFileSystem()

      // When
      const scanResult = await rtfs.scanDir(dir)

      // Then
      expect(scanResult).toEqual([
        {
          name: 'index.cjs',
          path: `${dir}/dist/index.cjs`,
          type: 'file',
        },
        {
          name: 'index.js',
          path: `${dir}/dist/index.js`,
          type: 'file',
        },
        {
          name: 'dist',
          path: `${dir}/dist`,
          type: 'directory',
        },
        {
          name: 'package-lock.json',
          path: `${dir}/package-lock.json`,
          type: 'file',
        },
        {
          name: 'package.json',
          path: `${dir}/package.json`,
          type: 'file',
        },
        {
          name: 'impl.js',
          path: `${dir}/src/impl.js`,
          type: 'file',
        },
        {
          name: 'index.js',
          path: `${dir}/src/index.js`,
          type: 'file',
        },
        {
          name: 'stuff.js',
          path: `${dir}/src/stuff.js`,
          type: 'file',
        },
        { name: 'src', path: `${dir}/src`, type: 'directory' },
      ])
    })
  })
})
