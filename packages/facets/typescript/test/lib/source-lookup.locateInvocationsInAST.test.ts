import { describe, expect, it } from 'vitest'

import { locateInstanceInAST, locateInvocationsInAST } from '@src/lib'
import { sourceToAST } from '@src/lib/ast'
import { InstanceDescription } from '@whimbrel/core-api'

import {
  SOURCE__SINGLE_FILE_VANILLA_KOA,
  SOURCE__SINGLE_FILE_DECLARE_AND_START_FUNCTION,
  SOURCE__SINGLE_FILE_IIFE_DECLARE_AND_START_FUNCTION,
  SOURCE__SINGLE_FILE_START_ARROW_FUNCTION,
  SOURCE__SINGLE_FILE_START_FUNCTION,
  SOURCE__KOA__PROCESS_ENV_WITH_OR_FALLBACK_FROM_LOCAL_VAR,
  SOURCE__FASTIFY__SINGLE_FILE__VANILLA,
} from '@test/source-fixtures'
import { stripASTDetails } from './fixtures'

describe('locateInvocationsInAST', () => {
  describe('Koa.listen invocations', () => {
    describe('Literal argument', () => {
      it.each([
        ['at file top level', SOURCE__SINGLE_FILE_VANILLA_KOA],
        ['in start function', SOURCE__SINGLE_FILE_START_FUNCTION],
        ['in start arrow function', SOURCE__SINGLE_FILE_START_ARROW_FUNCTION],
        ['in declare-and-start function', SOURCE__SINGLE_FILE_DECLARE_AND_START_FUNCTION],
        [
          'in declare-and-start iife',
          SOURCE__SINGLE_FILE_IIFE_DECLARE_AND_START_FUNCTION,
        ],
      ])('should locate listen invocation %s', async (_, sourceCode) => {
        // Given
        const ast = sourceToAST(sourceCode)
        const instanceDescription: InstanceDescription = {
          type: 'class',
          name: 'Koa',
          from: {
            type: 'library',
            name: 'koa',
            importType: 'default',
          },
        }
        const objectRefs = locateInstanceInAST(ast, instanceDescription)

        // When
        const invocations = locateInvocationsInAST(objectRefs, {
          name: 'listen',
          type: 'instance',
          instance: instanceDescription,
        })

        // Then
        expect(invocations).toHaveLength(1)
        expect(invocations[0].arguments.map((a: any) => a.value)).toEqual([4444])
      })
    })

    describe('Variable argument', () => {
      it('should resolve variable identifier to assignment expression', () => {
        // Given
        const ast = sourceToAST(SOURCE__KOA__PROCESS_ENV_WITH_OR_FALLBACK_FROM_LOCAL_VAR)
        const instanceDescription: InstanceDescription = {
          type: 'class',
          name: 'Koa',
          from: {
            type: 'library',
            name: 'koa',
            importType: 'default',
          },
        }
        const objectRefs = locateInstanceInAST(ast, instanceDescription)

        // When
        const invocations = locateInvocationsInAST(objectRefs, {
          name: 'listen',
          type: 'instance',
          instance: instanceDescription,
        })

        // Then
        expect(invocations).toHaveLength(1)
        expect(invocations[0].arguments).toEqual([
          expect.objectContaining({
            category: 'expression',
            type: 'Identifier',
            name: 'port',
            resolutions: [],
          }),
        ])
      })
    })
  })

  describe('Fastify.listen invocations', () => {
    describe('Literal argument', () => {
      it.each([['at file top level', SOURCE__FASTIFY__SINGLE_FILE__VANILLA]])(
        'should locate listen invocation %s',
        async (_, sourceCode) => {
          // Given
          const ast = sourceToAST(sourceCode)
          const instanceDescription: InstanceDescription = {
            type: 'return-value',
            name: 'Fastify',
            from: {
              type: 'library',
              name: 'fastify',
              importType: 'default',
            },
          }
          const objectRefs = locateInstanceInAST(ast, instanceDescription)

          // When
          const invocations = locateInvocationsInAST(objectRefs, {
            name: 'listen',
            type: 'instance',
            instance: instanceDescription,
          })

          // Then
          expect(invocations).toHaveLength(1)
          expect(stripASTDetails(invocations, ['type'])).toEqual([
            expect.objectContaining({
              type: 'CallExpression',
              name: 'listen',
              arguments: [
                {
                  type: 'ObjectExpression',
                  category: 'expression',
                  resolutions: [],
                  entries: [
                    {
                      type: 'ObjectProperty',
                      category: 'entry',
                      name: 'port',
                      value: {
                        type: 'NumericLiteral',
                        category: 'literal',
                        value: 2288,
                      },
                    },
                  ],
                },
              ],
            }),
          ])
        }
      )
    })
  })
})
