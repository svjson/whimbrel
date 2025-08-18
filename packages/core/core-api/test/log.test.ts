import { describe, expect, it } from 'vitest'
import { indent } from '@src/index'

describe('log', () => {
  describe('indent', () => {
    const testIndent = (cases: any) => {
      cases.forEach(({ indentation, message, expected }) => {
        it(`should indent '${message}' by ${indentation} levels`, () => {
          expect(indent(indentation, message)).toEqual(expected)
        })
      })
    }

    testIndent([
      {
        indentation: 0,
        message: 'Test',
        expected: 'Test',
      },
      {
        indentation: 1,
        message: 'Test',
        expected: '  Test',
      },
      {
        indentation: 2,
        message: 'Test',
        expected: '    Test',
      },
    ])
  })
})
