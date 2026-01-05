import { Token } from './types'

/**
 * Create a symbol token.
 *
 * @param symbol Symbol text
 *
 * @returns Token
 */
export const symbol = (symbol: string): Token => {
  return {
    type: 'symbol',
    text: symbol,
  }
}

/**
 * Create a word token.
 *
 * @param word Word text
 *
 * @returns Token
 */
export const word = (word: string): Token => {
  return {
    type: 'word',
    text: word,
  }
}

/**
 * Create a whitespace token.
 *
 * @param content Whitespace content
 *
 * @returns Token
 */
export const whitespace = (content: string = ' '): Token => {
  return {
    type: 'whitespace',
    text: content,
  }
}

/**
 * Create a string token.
 *
 * @param content String content
 *
 * @returns Token
 */
export const string = (content: string): Token => {
  return {
    type: 'string',
    text: content,
  }
}
