import { describe, expect, it } from 'vitest'
import { ExpressionStatement } from '@babel/types'
import { findNode, findRecursive, resolveExpression, sourceToAST } from '@src/lib'
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
            resolutions: [],
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
            resolutions: [],
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
            resolutions: [],
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

  describe('MemberExpression', () => {
    it.each([
      [
        { source: 'process.env.HTTP_PORT' },
        [
          {
            category: 'process-env',
            name: [
              {
                category: 'expression',
                name: 'HTTP_PORT',
                resolutions: [],
              },
            ],
          },
        ],
      ],
      [
        { source: 'process.argv[2]' },
        [
          {
            category: 'process-arg',
            argIndex: [
              {
                category: 'literal',
                value: 2,
              },
            ],
            resolutions: [],
          },
        ],
      ],
      [
        {
          source: [
            "const config = { auth: { psk: 'ABCDE' } }",
            'const secret = config.auth.psk',
          ].join('\n'),
          expr: 'config.auth.psk',
        },
        [
          {
            category: 'literal',
            value: 'ABCDE',
          },
        ],
      ],
    ] as [{ source: string; expr?: string }, any[]][])(
      'should resolve %s',
      async ({ source, expr }, expectedResolutions) => {
        // Given
        const ast = sourceToAST(source)
        const node = expr
          ? findNode(ast, { literal: expr })
          : findRecursive(ast.nodes[0], 'MemberExpression')[0]

        // When
        const resolutions = await resolveExpression(ast, node)

        // Then
        expect(stripASTDetails(resolutions)).toEqual(expectedResolutions)
      }
    )
  })

  describe('Identifier', () => {
    it.each([
      [
        'myVariable',
        [
          {
            category: 'expression',
            name: 'myVariable',
            resolutions: [],
          },
        ],
        true,
      ],
      [
        ['const myVar = 1234', 'myVar'].join('\n'),
        [
          {
            category: 'literal',
            value: 1234,
          },
        ],
        false,
      ],
    ])('should resolve %s', async (source, expectedResolutions, acceptUnresolved) => {
      // Given
      const ast = sourceToAST(source)
      const node = findRecursive(ast.nodes[0], 'Identifier')[0]

      // When
      const resolutions = await resolveExpression(ast, node, {
        acceptIdentifier: acceptUnresolved,
      })

      // Then
      expect(stripASTDetails(resolutions)).toEqual(expectedResolutions)
    })
  })

  describe('Invocation', () => {
    it.each([
      [
        'Number("2188")',
        [
          {
            type: 'SyntheticValue',
            category: 'literal',
            valueType: 'number',
            value: 2188,
          },
        ],
      ],
      [
        'Number(process.env.PORT) || 8321',
        [
          {
            type: 'CallExpression',
            category: 'builtin-funcall',
            name: 'Number',
            arguments: [
              {
                category: 'process-env',
                name: [
                  {
                    type: 'Identifier',
                    category: 'expression',
                    name: 'PORT',
                    resolutions: [],
                  },
                ],
                type: 'MemberExpression',
              },
            ],
            resolutions: [],
          },
          {
            type: 'NumericLiteral',
            category: 'literal',
            value: 8321,
          },
        ],
      ],
      [
        'Number(process.env.PORT || 8321)',
        [
          {
            type: 'CallExpression',
            category: 'builtin-funcall',
            name: 'Number',
            arguments: [
              {
                category: 'process-env',
                name: [
                  {
                    type: 'Identifier',
                    category: 'expression',
                    name: 'PORT',
                    resolutions: [],
                  },
                ],
                type: 'MemberExpression',
              },
            ],
            resolutions: [],
          },
          {
            type: 'SyntheticValue',
            category: 'literal',
            value: 8321,
            valueType: 'number',
          },
        ],
      ],
    ])('should resolve %s', async (source, expectedResolutions) => {
      // Given
      const ast = sourceToAST(source)
      const node = findRecursive<ExpressionStatement>(
        ast.nodes[0],
        'ExpressionStatement'
      )[0].expression

      // When
      const resolutions = await resolveExpression(ast, node)

      // Then
      expect(stripASTDetails(resolutions, ['type'])).toEqual(expectedResolutions)
    })
  })
})
