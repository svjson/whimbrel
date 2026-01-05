import { describe, it, expect } from 'vitest'
import { makeTokenizer } from '@src/index'
import { word, whitespace, tokenType, symbol } from '@src/tokenize'

describe('tokenType', () => {
  describe('symbol', () => {
    it.each(['=', '&&', '|', '2>'])(
      "should recognize '%s' as 'symbol'",
      (input: string) => {
        expect(tokenType(input)).toEqual('symbol')
      }
    )
  })
  describe('word', () => {
    it.each(['tsc', '64tass', 'ci:test'])(
      'should recognize "%s" as "word"',
      (input: string) => {
        expect(tokenType(input)).toEqual('word')
      }
    )
  })
  describe('invalid', () => {
    it.each(['tsc ', '64tass '])(
      'should not recognized "%s" as a valid token',
      (input: string) => {
        expect(tokenType(input)).toBeUndefined()
      }
    )
  })
})

describe('tokenize', () => {
  describe('command+arg', () => {
    it.each([['tsc --noEmit', [word('tsc'), whitespace(), word('--noEmit')]]])(
      'should tokenize "%s"',
      (input, tokens) => {
        expect(makeTokenizer().tokenize(input)).toEqual(tokens)
      }
    )
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
