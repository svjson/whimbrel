export interface Token {
  type: string
  text: string
}

export interface Tokenizer {
  tokenize: (line: string) => Token[]
}

export const symbol = (symbol: string): Token => {
  return {
    type: 'symbol',
    text: symbol,
  }
}

export const word = (word: string): Token => {
  return {
    type: 'word',
    text: word,
  }
}

export const whitespace = (content: string = ' '): Token => {
  return {
    type: 'whitespace',
    text: content,
  }
}

const SYMBOLS = ['=', '&&', '|']

const TOKEN_MATCHERS = [
  {
    type: 'word',
    match: (text: string) => {
      return text.match(/^[a-zA-Z0-9_\-@\/\.:]+$/)
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

const TOKENS = {
  symbol,
  whitespace,
  word,
}

export const tokenType = (buf: string): string | undefined => {
  return TOKEN_MATCHERS.find((m) => m.match(buf))?.type
}

export const tokenize = (line: string): Token[] => {
  const tokens = []
  let buf = ''
  let tok: null | string = null
  for (let i = 0; i < line.length; i++) {
    const nextChar = line.charAt(i)
    if (tok && tok !== tokenType(buf + nextChar)) {
      tokens.push(TOKENS[tok](buf))
      buf = ''
      tok = null
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

export const makeTokenizer = () => {
  return {
    tokenize(line: string): Token[] {
      return tokenize(line)
    },
  }
}
