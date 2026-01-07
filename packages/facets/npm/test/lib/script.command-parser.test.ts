import { describe, it, expect } from 'vitest'
import { makeNpmCommandParser } from '@src/lib'
import { Command } from '@whimbrel/script-parser'
import { NpmBinCommand } from './script/types'

describe('NpmCommandParser', () => {
  const testFn = (_: string, command: Command, expectedResult: NpmBinCommand[]) => {
    const parser = makeNpmCommandParser()

    expect(parser.parse(command)).toEqual(expectedResult)
  }

  type TestCase = [string, Command, NpmBinCommand[]]

  describe('npm run', () => {
    it.each([
      [
        'basic run command',
        {
          command: 'npm',
          args: ['run', 'test'],
        },
        [
          {
            type: 'npm',
            command: 'run',
            script: 'test',
            scope: {},
            description: {
              summary: 'Execute package.json script "test"',
              intent: {
                op: 'execute',
                kind: 'package.json-script',
                id: 'test',
                target: {
                  type: 'module',
                  module: 'self',
                },
              },
            },
          },
        ],
      ],
      [
        'run test --workspaces',
        {
          command: 'npm',
          args: ['run', 'test', '--workspaces'],
        },
        [
          {
            type: 'npm',
            command: 'run',
            script: 'test',
            scope: {
              type: 'workspaces',
            },
            description: {
              summary: 'Execute package.json script "test" in all modules',
              intent: {
                op: 'execute',
                kind: 'package.json-script',
                id: 'test',
                target: {
                  type: 'workspace',
                },
              },
            },
          },
        ],
      ],
      [
        '--workspaces run test',
        {
          command: 'npm',
          args: ['--workspaces', 'run', 'test'],
        },
        [
          {
            type: 'npm',
            command: 'run',
            script: 'test',
            scope: {
              type: 'workspaces',
            },
            description: {
              summary: 'Execute package.json script "test" in all modules',
              intent: {
                op: 'execute',
                kind: 'package.json-script',
                id: 'test',
                target: {
                  type: 'workspace',
                },
              },
            },
          },
        ],
      ],
    ] as TestCase[])('should parse %s', testFn)
  })

  describe('npm publish', () => {
    it.each([
      [
        'bare publish command',
        {
          command: 'npm',
          args: ['publish'],
        },
        [
          {
            type: 'npm',
            command: 'publish',
            scope: {},
            description: {
              summary: 'Publish package',
              intent: {
                op: 'publish',
                kind: 'package',
                target: {
                  type: 'module',
                  module: 'self',
                },
              },
            },
          },
        ],
      ],
      [
        'publish command with --access public',
        {
          command: 'npm',
          args: ['publish', '--access', 'public'],
        },
        [
          {
            type: 'npm',
            command: 'publish',
            scope: {
              accessType: 'public',
            },
            description: {
              summary: 'Publish public package',
              intent: {
                op: 'publish',
                kind: 'package',
                target: {
                  type: 'module',
                  module: 'self',
                  flags: {
                    accessType: 'public',
                  },
                },
              },
            },
          },
        ],
      ],
    ] as TestCase[])('should parse %s', testFn)
  })
})
