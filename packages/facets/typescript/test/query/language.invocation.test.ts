import { describe, expect, it } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'

import { queryLanguageInvocation } from '@src/query/language.invocation'
import { FunctionInvocationDescription } from '@whimbrel/core-api'
import {
  SOURCE__KOA__IMPORT_DEFAULT_RELATIVE_AND_LISTEN,
  SOURCE__KOA__INSTANTIATE_AND_DEFAULT_EXPORT,
  SOURCE__KOA__PROCESS_ARG_WITH_OR_FALLBACK,
  SOURCE__KOA__PROCESS_ENV_WITH_OR_FALLBACK,
  SOURCE__SINGLE_FILE_VANILLA_KOA,
} from '@test/source-fixtures'
const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('language:invocation', () => {
  it.each([
    [
      'with literal argument',
      [{ 'index.ts': SOURCE__SINGLE_FILE_VANILLA_KOA }],
      [
        {
          type: 'literal',
          literal: '4444',
          value: 4444,
        },
      ],
    ],
    [
      'with process-arg and fallback',
      [{ 'index.ts': SOURCE__KOA__PROCESS_ARG_WITH_OR_FALLBACK }],
      [
        {
          type: 'expression',
          literal: 'process.argv[1] || 4444',
          resolutions: [
            {
              type: 'process-arg',
              literal: 'process.argv[1]',
              argIndex: [
                {
                  type: 'literal',
                  literal: '1',
                  value: 1,
                },
              ],
            },
            {
              type: 'literal',
              literal: '4444',
              value: 4444,
            },
          ],
        },
      ],
    ],
    [
      'with process-env and fallback',
      [{ 'index.ts': SOURCE__KOA__PROCESS_ENV_WITH_OR_FALLBACK }],
      [
        {
          type: 'expression',
          literal: 'process.env.PORT || 4433',
          resolutions: [
            {
              type: 'process-env',
              literal: 'process.env.PORT',
              name: [
                {
                  type: 'symbol',
                  name: 'PORT',
                },
              ],
            },
            {
              type: 'literal',
              literal: '4433',
              value: 4433,
            },
          ],
        },
      ],
    ],
    [
      'on hard-coded port on instance imported via default import',
      [
        { 'index.ts': SOURCE__KOA__IMPORT_DEFAULT_RELATIVE_AND_LISTEN },
        { 'app.ts': SOURCE__KOA__INSTANTIATE_AND_DEFAULT_EXPORT },
      ],
      [
        {
          type: 'literal',
          literal: '4444',
          value: 4444,
        },
      ],
    ],
  ])('should locate listen-invocation %s', async (_, files, expectedArguments) => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(files, ctx.disk)
    const invocationDescription: FunctionInvocationDescription = {
      name: 'listen',
      type: 'instance',
      instance: {
        type: 'class',
        name: 'Koa',
        from: {
          type: 'library',
          name: 'koa',
          importType: 'default',
        },
      },
    }

    // When
    const result = await queryLanguageInvocation(ctx, {
      type: 'language:invocation',
      criteria: {
        functionInvocation: invocationDescription,
        sourceFolders: [root],
      },
    })

    // Then
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      language: 'typescript',
      description: invocationDescription,
      arguments: expectedArguments,
    })
  })
})
