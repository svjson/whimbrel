import { describe, expect, it } from 'vitest'
import { findRecursive, resolveExpression, sourceToAST } from '@src/lib'
import { stripASTDetails } from './fixtures'

describe('resolveExpression', () => {
  describe('LogicalExpression', () => {
    it.each([
      [
        'process.env.PORT || 1234',
        [
          {
            category: 'process-env',
            name: [
              {
                category: 'expression',
                name: 'PORT',
                resolutions: [],
              },
            ],
          },
          {
            category: 'literal',
            value: 1234,
          },
        ],
      ],
      [
        'process.argv[4] || 2222',
        [
          {
            category: 'process-arg',
            argIndex: [
              {
                category: 'literal',
                value: 4,
              },
            ],
          },
          {
            category: 'literal',
            value: 2222,
          },
        ],
      ],
      [
        'process.env.PORT ?? 1234',
        [
          {
            category: 'process-env',
            name: [
              {
                category: 'expression',
                name: 'PORT',
                resolutions: [],
              },
            ],
          },
          {
            category: 'literal',
            value: 1234,
          },
        ],
      ],
      [
        'process.argv[4] ?? 2222',
        [
          {
            category: 'process-arg',
            argIndex: [
              {
                category: 'literal',
                value: 4,
              },
            ],
          },
          {
            category: 'literal',
            value: 2222,
          },
        ],
      ],
      [
        'process.env.PORT || process.argv[2] || 4444',
        [
          {
            category: 'process-env',
            name: [
              {
                category: 'expression',
                name: 'PORT',
                resolutions: [],
              },
            ],
          },
          {
            category: 'process-arg',
            argIndex: [
              {
                category: 'literal',
                value: 2,
              },
            ],
          },
          {
            category: 'literal',
            value: 4444,
          },
        ],
      ],
    ])('should resolve %s', async (source, expectedResolutions) => {
      // Given
      const ast = sourceToAST(source)
      const node = findRecursive(ast.nodes[0], 'LogicalExpression')[0]

      // When
      const resolutions = await resolveExpression(ast, node)

      // Then
      expect(stripASTDetails(resolutions)).toEqual(expectedResolutions)
    })
  })
})
