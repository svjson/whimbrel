import { describe, expect, test } from 'vitest'
import { rewriteScript } from '@src/lib/script'

describe('rewriteScript', () => {
  describe('npm', () => {
    describe('execute', () => {
      test.each([
        [
          'npm run build --workspaces',
          'pnpm -r build',
          [
            {
              type: 'command',
              args: ['run', 'build', '--workspaces'],
              env: {},
              command: 'npm',
              literal: 'npm run build --workspaces',
              description: {
                summary: 'Execute package.json script "build" in all modules',
                intent: {
                  op: 'execute',
                  kind: 'package.json-script',
                  id: 'build',
                  target: { type: 'workspace' },
                },
              },
            },
          ],
        ],
        [
          'npm run dev --workspace @pennant/backend',
          'pnpm --filter @pennant/backend dev',
          [
            {
              type: 'command',
              args: ['run', 'dev', '--workspace', '@pennant/backend'],
              env: {},
              command: 'npm',
              literal: 'npm run dev --workspace @pennant/backend',
              description: {
                summary: 'Execute package.json script "dev" in module "@pennant/backend"',
                intent: {
                  op: 'execute',
                  kind: 'package.json-script',
                  id: 'dev',
                  target: { type: 'module', module: '@pennant/backend' },
                },
              },
            },
          ],
        ],
      ] as [string, string, any[]][])('"%s" => "%s"', (_, expected, script) => {
        expect(
          rewriteScript({
            description: script[0].description,
            script,
          })
        ).toEqual(expected)
      })
    })
  })
})
