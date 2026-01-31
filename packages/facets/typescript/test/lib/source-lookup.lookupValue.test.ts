import {
  readAsset,
  TYPESCRIPT__VITE_CONFIG__REACT_SERVER_PROXY_TEST,
  TYPESCRIPT__VITE_CONFIG__REACT_SERVER_PROXY__LAMBDA,
} from '@whimbrel-test/asset-fixtures'
import { describe, it, expect } from 'vitest'
import { sourceToAST } from '@src/lib/ast'
import { lookupDescription, lookupValue } from '@src/lib/source-lookup'
import {
  FunctionInvocationDescription,
  SourceLookupDescription,
} from '@whimbrel/core-api'
import { stripASTDetails, expressionTree } from './fixtures'

describe('lookupValue', () => {
  const { obj, property, synthetic, literal } = expressionTree()

  it('should find vite configuration as return value of lambda argument to defineConfig', async () => {
    const source = await readAsset(TYPESCRIPT__VITE_CONFIG__REACT_SERVER_PROXY__LAMBDA)

    const ast = sourceToAST(source)

    const result = await lookupValue(ast, {
      type: 'return-value',
      of: {
        type: 'function-declaration',
        identifiedBy: {
          type: 'positional-argument',
          position: 0,
          of: {
            type: 'function',
            name: 'defineConfig',
            from: {
              type: 'library',
              name: 'vite',
              importType: 'named',
              importName: 'defineConfig',
            },
          } satisfies FunctionInvocationDescription,
        },
      },
    } satisfies SourceLookupDescription)

    expect(result).toMatchObject({
      candidates: [
        {
          resolutions: [expect.any(Object)],
        },
      ],
    })
    expect(result.candidates.length).toBe(1)

    const [{ resolutions }] = result.candidates
    const [value] = resolutions

    expect(stripASTDetails(value)).toEqual({
      category: 'expression',
      entries: [
        {
          name: 'plugins',
          category: 'entry',
          value: expect.any(Object),
        },
        {
          name: 'server',
          category: 'entry',
          value: {
            category: 'expression',
            entries: [
              {
                category: 'entry',
                name: 'port',
                value: {
                  category: 'expression',
                  resolutions: [
                    {
                      category: 'literal',
                      value: 3000,
                    },
                  ],
                },
              },
              property(
                'proxy',
                obj([
                  property(
                    '/api',
                    obj([
                      property('target', {
                        category: 'expression',
                        resolutions: [literal('http://localhost:5050')],
                      }),
                      property('changeOrigin', literal(true)),
                      property('secure', literal(false)),
                      property('rewrite', { category: 'expression', resolutions: [] }),
                    ])
                  ),
                ])
              ),
            ],
            resolutions: [],
          },
        },
        property(
          'resolve',
          obj([
            property(
              'alias',
              obj([property('@', { category: 'expression', resolutions: [] })])
            ),
          ])
        ),
      ],
      resolutions: [],
    })
  })

  it('should extract server.port from return value of lambda argument to defineConfig', async () => {
    const source = await readAsset(TYPESCRIPT__VITE_CONFIG__REACT_SERVER_PROXY__LAMBDA)

    const ast = sourceToAST(source)

    const result = await lookupValue(ast, {
      type: 'object-path',
      path: 'server.port',
      of: {
        type: 'return-value',
        of: {
          type: 'function-declaration',
          identifiedBy: {
            type: 'positional-argument',
            position: 0,
            of: {
              type: 'function',
              name: 'defineConfig',
              from: {
                type: 'library',
                name: 'vite',
                importType: 'named',
                importName: 'defineConfig',
              },
            } satisfies FunctionInvocationDescription,
          },
        },
      },
    } satisfies SourceLookupDescription)

    expect(result).toMatchObject({
      candidates: [
        {
          resolutions: [expect.any(Object)],
        },
      ],
    })
    expect(result.candidates.length).toBe(1)

    const [{ resolutions }] = result.candidates

    expect(resolutions.map((r) => stripASTDetails(r))).toEqual([
      {
        category: 'literal',
        value: 3000,
      },
    ])
  })
})
