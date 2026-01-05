/**
 * A lexical token. The smallest parse:able unit.
 */
export interface Token {
  /**
   * The type of token.
   */
  type: string
  /**
   * The literal text content of the token.
   */
  text: string
}

/**
 * A tokenizer that can convert a line of text into tokens.
 */
export interface Tokenizer {
  /**
   * Tokenize a line of text into tokens.
   */
  tokenize: (line: string) => Token[]
}

/**
 * Create a symbol token.
 */
export const symbol = (symbol: string): Token => {
  return {
    type: 'symbol',
    text: symbol,
  }
}

/**
 * Create a word token.
 */
export const word = (word: string): Token => {
  return {
    type: 'word',
    text: word,
  }
}

/**
 * Create a whitespace token.
 */
export const whitespace = (content: string = ' '): Token => {
  return {
    type: 'whitespace',
    text: content,
  }
}

export const string = (content: string): Token => {
  return {
    type: 'string',
    text: content,
  }
}

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
export const makeTokenizer = () => {
  return {
    tokenize(line: string): Token[] {
      return tokenize(line)
    },
  }
}
