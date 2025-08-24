import path from 'path'
import { describe, it, expect } from 'vitest'

import { DiskFileSystem, MemoryFileSystem } from '@src/index'
import { makeTreeFixture } from '@whimbrel-test/tree-fixtures'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('MemoryFileSystem', () => {
  describe('read, write, Buffer and encoding', () => {
    it('it should write and read back a string', async () => {
      // Given
      const memFs = new MemoryFileSystem()
      await memFs.write('/tmp/something.txt', 'borrowed! :)', 'utf-8')

      // When
      const readValue = await memFs.read('/tmp/something.txt', 'utf-8')

      // Then
      expect(readValue).toEqual('borrowed! :)')
    })
  })

  describe('writeJson', () => {
    it('should serialize and write object contents', async () => {
      // Given
      const memFs = new MemoryFileSystem()
      const object = {
        name: 'Ulla-Bella',
        occupation: 'Secretary',
      }

      // When
      await memFs.writeJson('/in/the/belly/of/the/beast.json', object)

      // Then
      expect(memFs.paths).toEqual({
        '/': {},
        '/in/the/belly/of/the': {
          'beast.json': {
            content: Buffer.from(JSON.stringify(object, null, 2) + '\n', 'utf8'),
          },
        },
      })
    })
  })

  describe('readJson', () => {
    it('should return the file contents as parsed JSON', async () => {
      // Given
      const memFs = new MemoryFileSystem()

      const object = {
        name: 'Ulla-Bella',
        occupation: 'Secretary',
      }
      memFs.paths['/employee/files'] = {
        'ullabella.json': {
          content: Buffer.from(JSON.stringify(object, null, 2) + '\n', 'utf8'),
        },
      }

      // When
      const readObject = await memFs.readJson('/employee/files/ullabella.json')

      // Then
      expect(readObject).toEqual(object)
    })
  })

  describe('mkdir', () => {
    it('should recursively create all required directories', async () => {
      // Given
      const memFs = new MemoryFileSystem()

      // When
      await memFs.mkdir('/' + path.join('a', 'drop', 'in', 'the', 'ocean'), {
        recursive: true,
      })

      // Then
      expect(await memFs.exists('/a')).toBe(true)
      expect(await memFs.exists('/a/drop')).toBe(true)
      expect(await memFs.exists('/a/drop/in')).toBe(true)
      expect(await memFs.exists('/a/drop/in/the')).toBe(true)
      expect(await memFs.exists('/a/drop/in/the/ocean')).toBe(true)
    })
  })

  describe('scanDir', () => {
    it('should include empty subdirectories', async () => {
      // Given
      const memFs = new MemoryFileSystem()
      await memFs.mkdir('/' + path.join('a', 'drop', 'in', 'the', 'ocean'), {
        recursive: true,
      })

      // When
      const scanResult = await memFs.scanDir('/', { sort: true })

      // Then
      expect(scanResult).toEqual([
        {
          path: '/a',
          type: 'directory',
        },
        {
          path: '/a/drop',
          type: 'directory',
        },
        {
          path: '/a/drop/in',
          type: 'directory',
        },
        {
          path: '/a/drop/in/the',
          type: 'directory',
        },
        {
          path: '/a/drop/in/the/ocean',
          type: 'directory',
        },
      ])
    })

    it('should recursively scan target directory', async () => {
      // Given
      const memFs = new MemoryFileSystem()
      const dir = await createDirectory(
        [['src', ['app.ts', 'index.ts', ['services', ['todo-service.ts']]]]],
        memFs
      )

      // When
      const scanResult = await memFs.scanDir(dir, { sort: true })

      // Then
      expect(scanResult).toEqual([
        {
          path: `${dir}/src`,
          type: 'directory',
        },
        {
          path: `${dir}/src/app.ts`,
          type: 'file',
        },
        {
          path: `${dir}/src/index.ts`,
          type: 'file',
        },
        {
          path: `${dir}/src/services`,
          type: 'directory',
        },
        {
          path: `${dir}/src/services/todo-service.ts`,
          type: 'file',
        },
      ])
    })

    it('should recursively scan target directory and discard entries not matching filter', async () => {
      // Given
      const memFs = new MemoryFileSystem()
      const dir = await createDirectory(
        [
          'package.json',
          ['src', ['app.ts', 'index.ts', ['services', ['todo-service.ts']]]],
        ],
        memFs
      )

      // When
      const scanResult = await memFs.scanDir(dir, {
        sort: true,
        filter: (entry) => entry.type !== 'directory' && entry.path.endsWith('.ts'),
      })

      // Then
      expect(scanResult).toEqual([
        {
          path: `${dir}/src/app.ts`,
          type: 'file',
        },
        {
          path: `${dir}/src/index.ts`,
          type: 'file',
        },
        {
          path: `${dir}/src/services/todo-service.ts`,
          type: 'file',
        },
      ])
    })
  })
})
