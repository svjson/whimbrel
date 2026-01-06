import { Grammar, ParserStateMachine } from '@whimbrel/script-parser'
import { NpxBinCommand } from './types'

export type NpxGrammar = Grammar<NpxBinCommand, 'type' | 'command' | 'arg', never>

/**
 * Simple command/args grammar for npx
 */
export const npxGrammar: ParserStateMachine<NpxGrammar> = {
  initial: {
    transitions: [
      {
        text: 'npx',
        emit: 'type',
        state: 'npx',
      },
    ],
  },
  npx: {
    transitions: [
      {
        token: 'word',
        emit: 'command',
        state: 'args',
      },
    ],
  },
  args: {
    transitions: [
      {
        emit: 'arg',
        state: 'args',
      },
    ],
  },
}
