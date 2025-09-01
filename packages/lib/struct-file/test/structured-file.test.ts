import { describe, it, expect } from 'vitest'
import { JSONFile, makeRead, StorageAdapter } from '@src/index'

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
