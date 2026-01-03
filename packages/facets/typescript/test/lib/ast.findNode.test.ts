import {
  SOURCE__FASTIFY__SINGLE_FILE__VANILLA,
  SOURCE__KOA__PROCESS_ARG_WITH_OR_FALLBACK,
} from '@test/source-fixtures'
import { describe, expect, it } from 'vitest'
import { findNode, sourceToAST } from '@src/lib'

describe('findNode', () => {
  it.each([
    [
      'by type=Identifier',
      SOURCE__KOA__PROCESS_ARG_WITH_OR_FALLBACK,
      {
        type: 'Identifier',
      },
      {
        type: 'Identifier',
        name: 'Koa',
      },
      1,
    ],
    [
      'by type=Identifier and name=listen',
      SOURCE__KOA__PROCESS_ARG_WITH_OR_FALLBACK,
      {
        type: 'Identifier',
        name: 'listen',
      },
      {
        type: 'Identifier',
        name: 'listen',
      },
      5,
    ],
    [
      'by type=Identifier, name=Koa and parent.type=NewExpression',
      SOURCE__KOA__PROCESS_ARG_WITH_OR_FALLBACK,
      {
        type: 'Identifier',
        name: 'Koa',
        parent: { type: 'NewExpression' },
      },
      {
        type: 'Identifier',
        name: 'Koa',
      },
      3,
    ],
  ])(
    'should find Node in AST %s',
    (_, sourceCode, nodeCriteria, expected, expectedLineNumber) => {
      // Given
      const ast = sourceToAST(sourceCode)

      // When
      const node = findNode(ast, nodeCriteria)

      // Then
      expect(node).toMatchObject(expected)
      if (expectedLineNumber !== -1) {
        expect(node.loc.start.line).toEqual(expectedLineNumber)
      }
    }
  )
})
