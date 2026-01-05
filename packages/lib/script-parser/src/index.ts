export { makeParser, parseScript } from './parser'
export {
  makeParser as makeShellParser,
  makeTokenizer as makeShellTokenizer,
} from './shell'
export {
  makeParser as makeCommandParser,
  makeTokenizer as makeCommandTokenizer,
} from './command'

export type { Grammar, Parser, Token, Tokenizer } from './types'
export type { Emitter, ReaderState, Context, ParserOptions } from './parser'
export type { EndState, ParserStateMachine, State, Transition } from './state'
export type {
  ScriptNode,
  CommandNode,
  LogicalNode,
  KeywordNode,
  ShellGrammar,
} from './shell'
export type { Command, CommandParserOptions } from './command'
