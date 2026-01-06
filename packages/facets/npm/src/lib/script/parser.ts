import { makeCommandParser } from '@whimbrel/script-parser'
import { npmGrammar } from './grammar-npm'
import { makeNpmEmitter } from './emitter-npm'
import { npxGrammar } from './grammar-npx'
import { makeNpxEmitter } from './emitter-npx'

/**
 * Create an NPM command parser.
 */
export const makeNpmCommandParser = () => {
  return makeCommandParser({
    grammar: npmGrammar,
    emitter: makeNpmEmitter(),
  })
}

/**
 * Create an NPX command parser.
 */
export const makeNpxCommandParser = () => {
  return makeCommandParser({
    grammar: npxGrammar,
    emitter: makeNpxEmitter(),
  })
}
