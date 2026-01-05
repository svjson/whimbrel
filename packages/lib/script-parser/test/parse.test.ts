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
      ])(
        'should parse "%s" into a single command node with env dict',
        (script, expectedNodes) => {
          // Given
          const parser = makeParser()

          // When
          const ir = parser.parse(script)

          // Then
          expect(ir).toEqual(expectedNodes)
        }
      )
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
        [
          'cmd1 && cmd2 && cmd3',
          [
            {
              type: 'logical',
              kind: 'and',
              operator: '&&',
              literal: 'cmd1 && cmd2 && cmd3',
              left: {
                type: 'logical',
                kind: 'and',
                operator: '&&',
                literal: 'cmd1 && cmd2',
                left: {
                  type: 'command',
                  command: 'cmd1',
                  args: [],
                  env: {},
                  literal: 'cmd1',
                },
                right: {
                  type: 'command',
                  command: 'cmd2',
                  args: [],
                  env: {},
                  literal: 'cmd2',
                },
              },
              right: {
                type: 'command',
                command: 'cmd3',
                args: [],
                env: {},
                literal: 'cmd3',
              },
            },
          ],
        ],
      ])(
        'should parse "%s" into a nested single logical expression node',
        (script, expectedNodes) => {
          expect(makeParser().parse(script)).toEqual(expectedNodes)
        }
      )
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
        [
          'lsof -ti:7800 -ti:7810 -ti:7820 | xargs kill -9 2>/dev/null',
          [
            {
              type: 'forward',
              kind: 'err',
              operator: '2>',
              literal: 'lsof -ti:7800 -ti:7810 -ti:7820 | xargs kill -9 2> /dev/null',

              left: {
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
              right: {
                type: 'path',
                path: '/dev/null',
                literal: '/dev/null',
              },
            },
          ],
        ],
        [
          'lsof -ti:7800 -ti:7810 -ti:7820 | xargs kill -9 2>/dev/null || true',
          [
            {
              type: 'logical',
              kind: 'or',
              operator: '||',
              literal:
                'lsof -ti:7800 -ti:7810 -ti:7820 | xargs kill -9 2> /dev/null || true',
              left: {
                type: 'forward',
                kind: 'err',
                operator: '2>',
                literal: 'lsof -ti:7800 -ti:7810 -ti:7820 | xargs kill -9 2> /dev/null',
                left: {
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
                right: {
                  type: 'path',
                  path: '/dev/null',
                  literal: '/dev/null',
                },
              },
              right: {
                type: 'keyword',
                keyword: 'true',
                literal: 'true',
              },
            },
          ],
        ],
      ])(
        'should parse "%s" into a single nested forward node',
        (script, expectedNodes) => {
          expect(makeParser().parse(script)).toEqual(expectedNodes)
        }
      )
    })
    describe('string values', () => {
      it.each([
        [
          'echo "$PATH"',
          [
            {
              type: 'command',
              command: 'echo',
              args: ['"$PATH"'],
              env: {},
              literal: 'echo "$PATH"',
            },
          ],
        ],
        [
          "docker compose -f ../../docker-compose.yaml up -d && docker exec -i sql-service sh -lc '/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P \"$MSSQL_SA_PASSWORD\" -b -Q \"IF DB_ID(N'\\''app-test-db'\\'') IS NULL BEGIN CREATE DATABASE [app-test-db]; END\"'",
          [
            {
              type: 'logical',
              kind: 'and',
              operator: '&&',
              literal:
                "docker compose -f ../../docker-compose.yaml up -d && docker exec -i sql-service sh -lc '/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P \"$MSSQL_SA_PASSWORD\" -b -Q \"IF DB_ID(N'\\''app-test-db'\\'') IS NULL BEGIN CREATE DATABASE [app-test-db]; END\"'",
              left: {
                type: 'command',
                command: 'docker',
                args: ['compose', '-f', '../../docker-compose.yaml', 'up', '-d'],
                env: {},
                literal: 'docker compose -f ../../docker-compose.yaml up -d',
              },
              right: {
                type: 'command',
                command: 'docker',
                args: [
                  'exec',
                  '-i',
                  'sql-service',
                  'sh',
                  '-lc',
                  `'/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P \"$MSSQL_SA_PASSWORD\" -b -Q \"IF DB_ID(N'\\''app-test-db'\\'') IS NULL BEGIN CREATE DATABASE [app-test-db]; END\"'`,
                ],
                env: {},
                literal: `docker exec -i sql-service sh -lc '/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P \"$MSSQL_SA_PASSWORD\" -b -Q \"IF DB_ID(N'\\''app-test-db'\\'') IS NULL BEGIN CREATE DATABASE [app-test-db]; END\"'`,
              },
            },
          ],
        ],
      ])(
        'should parse "%s" into a single command with string argument',
        (script, expectedNodes) => {
          expect(makeParser().parse(script)).toEqual(expectedNodes)
        }
      )
    })
  })
})
