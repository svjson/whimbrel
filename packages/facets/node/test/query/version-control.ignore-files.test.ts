import { describe, expect, it } from 'vitest'
import { queryVersionControlIgnoreFiles } from '@src/query/version-control.ignore-files'
import { memFsContext } from '@whimbrel-test/context-fixtures'

describe('Queries', () => {
  describe('version-control:ignore-files', () => {
    it('should list node_modules', async () => {
      // Given
      const ctx = await memFsContext()

      // When
      const result = await queryVersionControlIgnoreFiles(ctx, {
        type: 'version-control:ignore-files',
      })

      // Then
      expect(result).toEqual([
        { pattern: 'node_modules', groups: ['generated'], source: 'node' },
      ])
    })
  })
})
