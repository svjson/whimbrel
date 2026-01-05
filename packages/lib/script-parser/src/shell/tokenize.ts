import { string, symbol, whitespace, word } from '@src/token'
import type { Token, Tokenizer } from '@src/types'

/**
 * List of recognized symbols.
 */
const SYMBOLS = [
  '=',
  '&',
  '&&',
  '|',
  '||',
  '>',
  '>>',
  '2>',
  '2>>',
  '(',
  ')',
  '[',
  ']',
  ';',
]

/**
 * Token matchers.
 */
const TOKEN_MATCHERS = [
  {
    type: 'word',
    match: (text: string) => {
      return text.match(/^(?:[a-zA-Z0-9_\-@\/\.:\$]|\\.)+$/)
    },
  },
  {
    type: 'string',
    match: (content: string) => {
      return content.match(/^(?:'.*'|".*")$/)
    },
  },
  {
    type: 'whitespace',
    match: (text: string) => {
      return text.match(/^\s+$/)
    },
  },
  {
    type: 'symbol',
    match: (text: string) => {
      return SYMBOLS.includes(text)
    },
  },
]

/**
 * Token constructors.
 */
const TOKENS = {
  string,
  symbol,
  whitespace,
  word,
}

/**
 * Determine the token type of a given buffer.
 */
export const tokenType = (buf: string): string | undefined => {
  return TOKEN_MATCHERS.find((m) => m.match(buf))?.type
}

/**
 * Tokenize a line of text into tokens.
 */
export const tokenize = (line: string): Token[] => {
  const tokens = []
  let buf = ''
  let tok: null | string = null
  for (let i = 0; i < line.length; i++) {
    const nextChar = line.charAt(i)
    const nextToken = tokenType(buf + nextChar)
    if (tok && tok !== nextToken) {
      if (nextToken === 'symbol') {
        tok = 'symbol'
      } else {
        tokens.push(TOKENS[tok](buf))
        buf = ''
        tok = null
      }
    }
    buf += nextChar
    if (!tok) {
      tok = tokenType(buf)
    }
  }
  if (tok && buf) {
    tokens.push(TOKENS[tok](buf))
  }
  return tokens
}

/**
 * Create a tokenizer instance.
 */
export const makeTokenizer = (): Tokenizer<string> => {
  return {
    tokenize(line: string): Token[] {
      return tokenize(line)
    },
  }
}
