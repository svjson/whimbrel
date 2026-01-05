import { describe, it, expect } from 'vitest'
import { tokenType } from '@src/command/tokenize'

describe('tokenType', () => {
  it.each([
    // Word
    ['tsc', 'word'],
    ['64tass', 'word'],
    ['ci:test', 'word'],
    // Flag
    ['-t', 'flag'],
    ['-zxvf', 'flag'],
    ['--if-present', 'flag'],
    ['--a', 'flag'],
    // Parameter
    ['--prop=value', 'parameter'],
    ['--version=2.0', 'parameter'],
    // String
    ['"$PATH"', 'string'],
    ["'$PATH'", 'string'],
    ['"The \"Thing\""', 'string'],
  ])(
    "should recognize '%s' as '%s'",
    (input: string, expectedType: string | undefined) => {
      expect(tokenType(input)).toEqual(expectedType)
    }
  )
})
