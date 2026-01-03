import { describe, expect, it } from 'vitest'
import { Identifier } from '@babel/types'
import { findIdentifierDefinition, findNode, sourceToAST } from '@src/lib'
import { SOURCE__FASTIFY__SINGLE_FILE__STARTUP_FUNCTION_WITH_PORT_ARG } from '@test/source-fixtures'
import { stripASTDetails } from './fixtures'

describe('findIdentifierDefinition', () => {
  describe('function argument', () => {
    it('should find argument in function declaration of enclosing function', () => {
      // Given
      const ast = sourceToAST(
        SOURCE__FASTIFY__SINGLE_FILE__STARTUP_FUNCTION_WITH_PORT_ARG
      )
      const node = findNode<Identifier>(ast, {
        type: 'Identifier',
        name: 'port',
        parent: { type: 'ObjectProperty' },
      })

      // When
      const definition = findIdentifierDefinition(ast, node)

      // Then
      expect(definition).not.toBeUndefined()
      expect(stripASTDetails(definition, ['type'])).toEqual([
        {
          type: 'FunctionArgumentDeclaration',
          name: 'startServer',
          exports: [],
          argument: {
            type: 'positional',
            name: 'port',
            index: 1,
          },
        },
      ])
    })
  })
})
