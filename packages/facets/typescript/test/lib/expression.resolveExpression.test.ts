import { describe, expect, it } from 'vitest'
import { ExpressionStatement, ObjectExpression } from '@babel/types'
import { findNode, findRecursive, resolveExpression, sourceToAST } from '@src/lib'
import { stripASTDetails, expressionTree } from './fixtures'

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

  describe('ObjectExpression', () => {
    const { obj, property, literal, synthetic } = expressionTree('type')

    it.each([
      [
        'flat object with literals',
        'const obj = { id: 24, name: "Burt" }',
        [obj([property('id', literal(24)), property('name', literal('Burt'))])],
      ],
      [
        'nested object with literals',
        'const obj = { details: { id: 18, name: "Klodvig" } }',
        [
          obj([
            property(
              'details',
              obj([property('id', literal(18)), property('name', literal('Klodvig'))])
            ),
          ]),
        ],
      ],
      [
        'nested object with synthetic value',
        'const myVar = "48"; const obj = { details: { id: Number(myVar), name: "Cody" }}',
        [
          obj([
            property(
              'details',
              obj([
                property('id', {
                  type: 'CallExpression',
                  category: 'expression',
                  resolutions: [synthetic('number', 48)],
                }),
                property('name', literal('Cody')),
              ])
            ),
          ]),
        ],
      ],
      [
        'flat object with logical expression property value',
        'const obj = { id: getId() || 0, name: "Mary" }',
        [
          obj([
            property('id', {
              type: 'LogicalExpression',
              category: 'expression',
              resolutions: [literal(0)],
            }),
            property('name', literal('Mary')),
          ]),
        ],
      ],
      [
        'flat object with string literal key',
        'const obj = { "/endpoints": "off" }',
        [obj([property('/endpoints', literal('off'))])],
      ],
    ])('should resolve %s', async (_, source, expectedResolutions) => {
      // Given
      const ast = sourceToAST(source)
      const node = findNode(ast, {
        type: 'ObjectExpression',
      })

      // When
      const resolutions = await resolveExpression(ast, node)

      // Then
      expect(stripASTDetails(resolutions, ['type'])).toEqual(expectedResolutions)
    })
  })
})
