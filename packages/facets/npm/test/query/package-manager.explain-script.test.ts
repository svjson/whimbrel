import { describe, expect, it } from 'vitest'
import { queryExplainScript } from '@src/query/package-manager.explain-script'
import { memFsContext } from '@whimbrel-test/context-fixtures'

describe('Queries', () => {
  describe('package-manager:explain-script', () => {
    it('should', async () => {
      // Given
      const ctx = await memFsContext()

      // When
      const result = await queryExplainScript(ctx, {
        type: 'package-manager:explain-script',
        criteria: {
          scriptContent: 'npm run test:integration',
        },
      })

      // Then
      const expectedSummary = 'Execute package.json script "test:integration"'
      const expectedIntent = {
        op: 'execute',
        kind: 'package.json-script',
        id: 'test:integration',
        target: {
          type: 'module',
          module: 'self',
        },
      }
      expect(result).toEqual({
        description: {
          summary: expectedSummary,
          intent: expectedIntent,
        },
        script: [
          {
            type: 'command',
            command: 'npm',
            args: ['run', 'test:integration'],
            env: {},
            literal: 'npm run test:integration',
            description: {
              summary: 'Execute package.json script "test:integration"',
              intent: expectedIntent,
            },
          },
        ],
      })
    })
  })
})
