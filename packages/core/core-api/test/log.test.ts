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

    it('should indent each line of a string with line breaks', () => {
      expect(
        indent(
          2,
          [
            'Line #1 goes first',
            'Line #2 comes after',
            'Line #3 is last, and also gets indented',
          ].join('\n')
        )
      ).toEqual(
        [
          '    Line #1 goes first',
          '    Line #2 comes after',
          '    Line #3 is last, and also gets indented',
        ].join('\n')
      )
    })
  })
})
