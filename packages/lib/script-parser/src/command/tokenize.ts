import type { Token, Tokenizer } from '@src/types'
import { Command } from './types'

/**
 * Token matchers.
 */
const TOKEN_MATCHERS = [
  {
    type: 'string',
    match: (content: string) => {
      return content.match(/^(?:'.*'|".*")$/)
    },
  },
  {
    type: 'parameter',
    match: (text: string) => {
      return text.match(/^-[^=]+=.*$/)
    },
  },
  {
    type: 'flag',
    match: (text: string) => {
      return text.startsWith('-')
    },
  },
  {
    type: 'word',
    match: (_text: string) => {
      return true
    },
  },
]

/**
 * Construct a command Token
 *
 * @param command The command name
 *
 * @returns A command-Token
 */
export const command = (command: string): Token => ({
  type: 'command',
  text: command,
})

/**
 * Determine the token type of the given content
 */
export const tokenType = (content: string): string | undefined => {
  return TOKEN_MATCHERS.find((m) => m.match(content))?.type
}

/**
 * Create a simple tokenizer for commands that are already partitioned
 * into base command and arguments.
 *
 * Does not perform any granular tokenization, but simply categorizes
 * the arguments based on general shape.
 *
 * @param input Command input
 * @returns Tokens
 */
export const makeTokenizer = (): Tokenizer<Command> => {
  return {
    tokenize(input: Command) {
      return [
        {
          type: 'command',
          text: input.command,
        },
        ...input.args.map((a) => ({
          type: tokenType(a),
          text: a,
        })),
      ]
    },
  }
}
