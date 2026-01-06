import { describe, it, expect } from 'vitest'
import { makeNpmCommandParser } from '@src/lib'

describe('NpmCommandParser', () => {
  describe('npm run', () => {
    it('should parse basic run command', () => {
      const parser = makeNpmCommandParser()

      expect(
        parser.parse({
          command: 'npm',
          args: ['run', 'test'],
        })
      ).toEqual([
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
      ])
    })
  })

  describe('npm publish', () => {
    it('should parse bare publish command', () => {
      const parser = makeNpmCommandParser()

      expect(
        parser.parse({
          command: 'npm',
          args: ['publish'],
        })
      ).toEqual([
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
      ])
    })

    it('should parse publish command with --access public', () => {
      const parser = makeNpmCommandParser()

      expect(
        parser.parse({
          command: 'npm',
          args: ['publish', '--access', 'public'],
        })
      ).toEqual([
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
      ])
    })
  })
})
