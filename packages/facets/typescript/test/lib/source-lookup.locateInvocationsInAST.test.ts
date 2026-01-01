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
} from '@test/source-fixtures'

describe('locateInvocationsInAST', () => {
  it.each([
    ['at file top level', SOURCE__SINGLE_FILE_VANILLA_KOA],
    ['in start function', SOURCE__SINGLE_FILE_START_FUNCTION],
    ['in start arrow function', SOURCE__SINGLE_FILE_START_ARROW_FUNCTION],
    ['in declare-and-start function', SOURCE__SINGLE_FILE_DECLARE_AND_START_FUNCTION],
    ['in declare-and-start iife', SOURCE__SINGLE_FILE_IIFE_DECLARE_AND_START_FUNCTION],
  ])('should locate object invocation %s', async (_, sourceCode) => {
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
