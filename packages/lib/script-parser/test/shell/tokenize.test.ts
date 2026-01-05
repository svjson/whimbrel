import { describe, it, expect } from 'vitest'
import { makeTokenizer } from '@src/index'
import { tokenType } from '@src/shell/tokenize'
import { word, whitespace, symbol, string } from '@src/token'

describe('tokenType', () => {
  it.each([
    // Symbol
    ['=', 'symbol'],
    ['&&', 'symbol'],
    ['|', 'symbol'],
    ['2>', 'symbol'],
    // Word
    ['tsc', 'word'],
    ['64tass', 'word'],
    ['ci:test', 'word'],
    // String
    ['"$PATH"', 'string'],
    ["'$PATH'", 'string'],
    ['"The \"Thing\""', 'string'],
    // Undefined
    ['tsc ', undefined],
    ['64tass ', undefined],
  ])(
    "should recognize '%s' as '%s'",
    (input: string, expectedType: string | undefined) => {
      expect(tokenType(input)).toEqual(expectedType)
    }
  )
})

describe('tokenize', () => {
  describe('command+arg', () => {
    it.each([
      ['tsc --noEmit', [word('tsc'), whitespace(), word('--noEmit')]],
      ['echo "$PATH"', [word('echo'), whitespace(), string('"$PATH"')]],
    ])('should tokenize "%s"', (input, tokens) => {
      expect(makeTokenizer().tokenize(input)).toEqual(tokens)
    })
  })
  describe('env', () => {
    it.each([
      ['AUTH_TOKEN=abcdefgh', [word('AUTH_TOKEN'), symbol('='), word('abcdefgh')]],
    ])('should tokenize "%s"', (input, tokens) => {
      expect(makeTokenizer().tokenize(input)).toEqual(tokens)
    })
  })
  describe('env+command', () => {
    it.each([
      [
        'AUTH_TOKEN=abcdefgh ./publish.sh',
        [
          word('AUTH_TOKEN'),
          symbol('='),
          word('abcdefgh'),
          whitespace(),
          word('./publish.sh'),
        ],
      ],
    ])('should tokenize "%s"', (input, tokens) => {
      expect(makeTokenizer().tokenize(input)).toEqual(tokens)
    })
  })
  describe('command+redirect+path/command', () => {
    it.each([
      [
        'cmd1 | cmd2',
        [word('cmd1'), whitespace(), symbol('|'), whitespace(), word('cmd2')],
      ],
      [
        'cmd1 2> /dev/null',
        [word('cmd1'), whitespace(), symbol('2>'), whitespace(), word('/dev/null')],
      ],
    ])('should tokenize "%s"', (input, tokens) => {
      expect(makeTokenizer().tokenize(input)).toEqual(tokens)
    })
  })
})
