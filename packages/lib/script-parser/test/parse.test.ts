import { describe, it, expect } from 'vitest'
import { makeParser } from '@src/index'

describe('parse', () => {
  describe('single command', () => {
    describe('plain', () => {
      it.each([
        [
          'tsc',
          [
            {
              type: 'command',
              command: 'tsc',
              args: [],
              env: {},
              literal: 'tsc',
            },
          ],
        ],
        [
          'tsc --noEmit',
          [
            {
              type: 'command',
              command: 'tsc',
              args: ['--noEmit'],
              env: {},
              literal: 'tsc --noEmit',
            },
          ],
        ],
        [
          'pnpm -r lint',
          [
            {
              type: 'command',
              command: 'pnpm',
              args: ['-r', 'lint'],
              env: {},
              literal: 'pnpm -r lint',
            },
          ],
        ],
        [
          'pnpm -r run build',
          [
            {
              type: 'command',
              command: 'pnpm',
              args: ['-r', 'run', 'build'],
              env: {},
              literal: 'pnpm -r run build',
            },
          ],
        ],
        [
          'pnpm --filter @org/package-name run typecheck',
          [
            {
              type: 'command',
              command: 'pnpm',
              args: ['--filter', '@org/package-name', 'run', 'typecheck'],
              env: {},
              literal: 'pnpm --filter @org/package-name run typecheck',
            },
          ],
        ],
        [
          'pnpm --filter @some-org/one-more-pkg run ci:test',
          [
            {
              type: 'command',
              command: 'pnpm',
              args: ['--filter', '@some-org/one-more-pkg', 'run', 'ci:test'],
              env: {},
              literal: 'pnpm --filter @some-org/one-more-pkg run ci:test',
            },
          ],
        ],
      ])('should parse "%s" into a single command node', (script, expectedNodes) => {
        // Given
        const parser = makeParser()

        // When
        const ir = parser.parse(script)

        // Then
        expect(ir).toEqual(expectedNodes)
      })
    })

    describe('env-prefixed', () => {
      it.each([
        [
          'DOTENV_CONFIG_PATH=.env.ci jest',
          [
            {
              type: 'command',
              command: 'jest',
              args: [],
              env: {
                DOTENV_CONFIG_PATH: '.env.ci',
              },
              literal: 'DOTENV_CONFIG_PATH=.env.ci jest',
            },
          ],
        ],
        [
          'DOTENV_CONFIG_PATH=.env.test jest --watch',
          [
            {
              type: 'command',
              command: 'jest',
              args: ['--watch'],
              env: {
                DOTENV_CONFIG_PATH: '.env.test',
              },
              literal: 'DOTENV_CONFIG_PATH=.env.test jest --watch',
            },
          ],
        ],
      ])('should parse "%s" into a single command node', (script, expectedNodes) => {
        // Given
        const parser = makeParser()

        // When
        const ir = parser.parse(script)

        // Then
        expect(ir).toEqual(expectedNodes)
      })
    })

    describe('logical expr', () => {
      it.each([
        [
          'pnpm migrate:up && node src/index.js',
          [
            {
              type: 'logical',
              kind: 'and',
              operator: '&&',
              literal: 'pnpm migrate:up && node src/index.js',
              left: {
                type: 'command',
                command: 'pnpm',
                args: ['migrate:up'],
                env: {},
                literal: 'pnpm migrate:up',
              },
              right: {
                type: 'command',
                command: 'node',
                args: ['src/index.js'],
                env: {},
                literal: 'node src/index.js',
              },
            },
          ],
        ],
      ])('should parse "%s" into a single command node', (script, expectedNodes) => {
        expect(makeParser().parse(script)).toEqual(expectedNodes)
      })
    })

    describe('forward', () => {
      it.each([
        [
          'lsof -ti:7800 -ti:7810 -ti:7820 | xargs kill -9',
          [
            {
              type: 'forward',
              kind: 'pipe',
              operator: '|',
              literal: 'lsof -ti:7800 -ti:7810 -ti:7820 | xargs kill -9',
              left: {
                type: 'command',
                command: 'lsof',
                args: ['-ti:7800', '-ti:7810', '-ti:7820'],
                env: {},
                literal: 'lsof -ti:7800 -ti:7810 -ti:7820',
              },
              right: {
                type: 'command',
                command: 'xargs',
                args: ['kill', '-9'],
                env: {},
                literal: 'xargs kill -9',
              },
            },
          ],
        ],
      ])('should parse "%s" into a single command node', (script, expectedNodes) => {
        expect(makeParser().parse(script)).toEqual(expectedNodes)
      })
    })
  })
})
