import { Grammar, ParserStateMachine } from '@whimbrel/script-parser'
import { NpmBinCommand } from './types'

/**
 * Grammar type definition the Npm Command Grammar
 */
export type NpmGrammar = Grammar<
  NpmBinCommand,
  | 'type'
  | 'command'
  | 'arg'
  | 'script-name'
  | 'workspaces-scope'
  | 'workspace-module'
  | 'if-present'
  | 'access-type',
  never
>

/**
 * The grammar state machine for the npm grammar
 */
export const npmGrammar: ParserStateMachine<NpmGrammar> = {
  initial: {
    transitions: [
      {
        text: 'npm',
        emit: 'type',
        state: 'npm',
      },
    ],
  },
  npm: {
    transitions: [
      {
        text: '--workspaces',
        emit: 'workspaces-scope',
        state: 'npm',
      },
      {
        text: 'run',
        emit: 'command',
        state: 'run',
      },
      {
        text: 'publish',
        emit: 'command',
        state: 'publish',
      },
    ],
  },
  publish: {
    transitions: [
      {
        text: '--access',
        state: {
          transitions: [
            {
              token: 'word',
              emit: 'access-type',
              state: {
                transitions: [],
              },
            },
          ],
        },
      },
    ],
  },
  run: {
    transitions: [
      {
        text: '--workspaces',
        emit: 'workspaces-scope',
        state: 'run',
      },
      {
        token: 'word',
        emit: 'script-name',
        state: {
          transitions: [
            {
              text: '--if-present',
              emit: 'if-present',
              state: {
                transitions: [],
              },
            },
            {
              text: '--workspace',
              state: 'postCmdWs',
            },
            {
              text: '--workspaces',
              emit: 'workspaces-scope',
              state: 'run',
            },
          ],
        },
      },
    ],
  },
  postCmd: {
    transitions: [
      {
        text: '--workspace',
        state: 'postCmdWs',
      },
    ],
  },
  postCmdWs: {
    transitions: [
      {
        token: 'word',
        emit: 'workspace-module',
        state: 'postCmd',
      },
    ],
  },
}
