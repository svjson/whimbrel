import { ParserStateMachine } from '@src/state'
import type { Grammar, Parser, Tokenizer } from '@src/types'
import { makeParser as makeBaseParser, Emitter, ParserOptions } from '@src/parser'

import type { Command } from './types'
import { makeTokenizer } from './tokenize'

/**
 * Options for creating a command parser, that allows relying on the
 * default tokenizer.
 */
export interface CommandParserOptions<G extends Grammar> {
  grammar: ParserStateMachine<G>
  tokenizer?: Tokenizer<Command>
  emitter: Emitter<G>
}

/**
 * Create a parser for command inputs, where the base command and individual
 * arguments are already known.
 *
 * This parser does not support any shell gymnastics, piping or logical expressions
 * but is solely for the purpose of single commands and their parameter syntax.
 *
 * @param options Parser options
 *
 * @returns a Parser instance
 */
export const makeParser = <G extends Grammar>(
  opts: CommandParserOptions<G>
): Parser<Command, G['Output']> => {
  const parserOpts: ParserOptions<G, Command> = {
    grammar: opts.grammar,
    tokenizer: opts.tokenizer ?? makeTokenizer(),
    emitter: opts.emitter,
  }

  return makeBaseParser(parserOpts)
}
