import path from 'node:path'
import { describe, it, expect } from 'vitest'
import { ifFileExistsAt, JSONFile, makeRead, StorageAdapter } from '@src/index'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import { makeTreeFixture } from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('ifFileExistsAt', () => {
  it('should find file at filePath/+/fileName', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [{ 'file.txt': ['Here be data-dragons'] }],
      ctx.disk
    )

    // When
    const resolvedPath = await ifFileExistsAt(
      ctx.disk,
      root,
      'file.txt',
      async (fPath) => {
        return fPath
      }
    )

    // Then
    expect(resolvedPath).toEqual(path.join(root, 'file.txt'))
  })

  it('should find file at filePath and disregard fileName if filePath is a file', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [{ 'file.txt': ['Here be data-dragons'] }],
      ctx.disk
    )

    // When
    const resolvedPath = await ifFileExistsAt(
      ctx.disk,
      [root, 'file.txt'],
      'blep.txt',
      async (fPath) => {
        return fPath
      }
    )

    // Then
    expect(resolvedPath).toEqual(path.join(root, 'file.txt'))
  })
})

describe('makeRead', () => {
  it('should generate a function that reads from provided storage', async () => {
    // Given
    const storage = {
      exists: (_filePath: string) => true,
      read: (filePath: string, opts?: any) => {
        if (filePath === '/tmp/somewhere/data.json' && opts === 'utf8') {
          return JSON.stringify({ lots: 'of', data: 'here' })
        } else {
          throw new Error(`Unexpected input: ${filePath}, ${opts}`)
        }
      },
      isDirectory: (filePath: string) => {
        return filePath === '/tmp/somewhere'
      },
    } as unknown as StorageAdapter

    // When
    const readFunction = makeRead(JSONFile, 'data.json', (s, p) => s.read(p, 'utf8'))
    const jsonFile = await readFunction(storage, '/tmp/somewhere')

    // Then
    expect(jsonFile.getContent()).toEqual({
      lots: 'of',
      data: 'here',
    })
  })
})
