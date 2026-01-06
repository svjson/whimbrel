import { describe, it, expect } from 'vitest'
import { makeShellParser } from '@whimbrel/script-parser'
import { decorateScript } from '@src/lib'

describe('decorateScript', () => {
  it.each([
    [
      'npm run --workspaces test --if-present',
      'Execute package.json script "test" in all modules that provide it',
      {
        op: 'execute',
        kind: 'package.json-script',
        id: 'test',
        target: {
          type: 'workspace',
          discriminator: 'exists',
        },
      },
    ],
  ])('should decorate "%s"', async (script, expectedSummary, expectedIntent) => {
    // Given
    const scriptIR = makeShellParser().parse(script)

    // When
    await decorateScript(scriptIR)

    // Then
    expect(scriptIR[0].description).toEqual({
      summary: expectedSummary,
      intent: expectedIntent,
    })
  })
})
