import { describe, expect, it } from 'vitest'

import { locateInstanceInAST } from '@src/lib'
import { sourceToAST } from '@src/lib/ast'

import {
  SOURCE__KOA__IMPORT_RELATIVE_AND_LISTEN,
  SOURCE__KOA__INSTANTIATE_AND_DEFAULT_EXPORT,
  SOURCE__KOA__INSTANTIATE_AND_EXPORT,
  SOURCE__SINGLE_FILE_VANILLA_KOA,
} from '@test/source-fixtures'
import { stripASTDetails } from './fixtures'

describe('locateInstanceInAST', () => {
  it.each([['at file top level', SOURCE__SINGLE_FILE_VANILLA_KOA]])(
    'should locate class instantiation %s',
    (_, sourceCode) => {
      // Given
      const ast = sourceToAST(sourceCode)

      // When
      const result = locateInstanceInAST(ast, {
        type: 'class',
        name: 'Koa',
        from: {
          type: 'library',
          name: 'koa',
          importType: 'default',
        },
      })

      // Then
      expect(result).toHaveLength(1)
      expect(stripASTDetails(result[0], ['type', 'node'])).toMatchObject({
        type: 'VariableDeclaration',
        name: 'app',
        expression: expect.objectContaining({
          type: 'NewExpression',
        }),
        exports: [],
        node: expect.objectContaining({
          start: 23,
          end: 44,
        }),
      })
    }
  )

  it('should locate imported instance from import', () => {
    // Given
    const ast = sourceToAST(
      SOURCE__KOA__IMPORT_RELATIVE_AND_LISTEN,
      '/project/src/index.ts'
    )

    // When
    const result = locateInstanceInAST(ast, {
      type: 'identifier',
      name: 'app',
      from: {
        type: 'tree',
        name: '/project/src/app.ts',
        importType: 'named',
        importName: 'app',
      },
    })

    // Then
    expect(result).toHaveLength(1)
    expect(stripASTDetails(result[0], ['type', 'node'])).toEqual({
      name: 'app',
      importType: 'named',
      type: 'ImportDeclaration',
      node: expect.objectContaining({
        type: 'ImportDeclaration',
      }),
    })
  })

  it.each([
    [
      'at declaration at file top level',
      SOURCE__KOA__INSTANTIATE_AND_EXPORT,
      [{ type: 'named', name: 'app' }],
    ],
    [
      'as default export',
      SOURCE__KOA__INSTANTIATE_AND_DEFAULT_EXPORT,
      [{ type: 'default' }],
    ],
  ])(
    'should locate class instantiation exported %s',
    (_, sourceCode, expectedExports) => {
      // Given
      const ast = sourceToAST(sourceCode)

      // When
      const result = locateInstanceInAST(ast, {
        type: 'class',
        name: 'Koa',
        from: {
          type: 'library',
          name: 'koa',
          importType: 'default',
        },
      })

      // Then
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        type: 'VariableDeclaration',
        name: 'app',
        expression: expect.objectContaining({
          type: 'NewExpression',
        }),
        exports: expectedExports,
        node: expect.objectContaining({
          type: 'VariableDeclaration',
        }),
        ast: expect.objectContaining({
          parseResult: expect.objectContaining({
            type: 'File',
          }),
        }),
      })
    }
  )
})
