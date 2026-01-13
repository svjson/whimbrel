import { describe, expect, it } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'

import { queryLanguageInvocation } from '@src/query/language.invocation'
import { FunctionInvocationDescription } from '@whimbrel/core-api'
import {
  SOURCE__EXPRESS__SINGLE_FILE__PARSED_PROCESS_ENV_WITH_FALLBACK,
  SOURCE__EXPRESS__SINGLE_FILE__VANILLA,
  SOURCE__FASTIFY__SINGLE_FILE__STARTUP_ARROW_FUNCTION_WITH_CONFIG_OBJ_DEREF,
  SOURCE__FASTIFY__SINGLE_FILE__STARTUP_ARROW_FUNCTION_WITH_PORT_ARG,
  SOURCE__FASTIFY__SINGLE_FILE__STARTUP_FUNCTION_WITH_PORT_ARG,
  SOURCE__FASTIFY__SINGLE_FILE__VANILLA,
  SOURCE__KOA__IMPORT_DEFAULT_RELATIVE_AND_LISTEN,
  SOURCE__KOA__INSTANTIATE_AND_DEFAULT_EXPORT,
  SOURCE__KOA__PROCESS_ARG_WITH_OR_FALLBACK,
  SOURCE__KOA__PROCESS_ENV_WITH_OR_FALLBACK,
  SOURCE__KOA__PROCESS_ENV_WITH_OR_FALLBACK_FROM_LOCAL_VAR,
  SOURCE__SINGLE_FILE_VANILLA_KOA,
} from '@test/source-fixtures'
const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('language:invocation', () => {
  describe('Query Fastify.listen', () => {
    it.each([
      [
        'with literal argument',
        [{ 'index.ts': SOURCE__FASTIFY__SINGLE_FILE__VANILLA }],
        [
          {
            type: 'object',
            literal: '{ port: 2288 }',
            properties: [
              {
                key: 'port',
                value: {
                  type: 'literal',
                  value: 2288,
                  literal: '2288',
                },
              },
            ],
          },
        ],
      ],
      [
        'in startup arrow-function that takes port as arg',
        [
          {
            'index.ts':
              SOURCE__FASTIFY__SINGLE_FILE__STARTUP_ARROW_FUNCTION_WITH_PORT_ARG,
          },
        ],
        [
          {
            type: 'object',
            literal: "{ port, host: '0.0.0.0' }",
            properties: [
              {
                key: 'port',
                value: {
                  type: 'symbol',
                  name: 'port',
                  resolutions: [
                    {
                      type: 'literal',
                      value: 8888,
                      literal: '8888',
                    },
                  ],
                },
              },
              {
                key: 'host',
                value: {
                  type: 'literal',
                  value: '0.0.0.0',
                  literal: "'0.0.0.0'",
                },
              },
            ],
          },
        ],
      ],
      [
        'in startup-function that takes port as arg',
        [{ 'index.ts': SOURCE__FASTIFY__SINGLE_FILE__STARTUP_FUNCTION_WITH_PORT_ARG }],
        [
          {
            type: 'object',
            literal: "{ port, host: '0.0.0.0' }",
            properties: [
              {
                key: 'port',
                value: {
                  type: 'symbol',
                  name: 'port',
                  resolutions: [
                    {
                      type: 'literal',
                      value: 8888,
                      literal: '8888',
                    },
                  ],
                },
              },
              {
                key: 'host',
                value: {
                  type: 'literal',
                  value: '0.0.0.0',
                  literal: "'0.0.0.0'",
                },
              },
            ],
          },
        ],
      ],
      [
        'in startup arrow-function that dereferences config object argument with member expressions',
        [
          {
            'index.ts':
              SOURCE__FASTIFY__SINGLE_FILE__STARTUP_ARROW_FUNCTION_WITH_CONFIG_OBJ_DEREF,
          },
        ],
        [
          {
            type: 'object',
            literal: '{ port: config.http.port, host: config.http.host }',
            properties: [
              {
                key: 'port',
                value: {
                  type: 'expression',
                  literal: 'config.http.port',
                  resolutions: [
                    {
                      type: 'literal',
                      value: 8484,
                      literal: '8484',
                    },
                  ],
                },
              },
              {
                key: 'host',
                value: {
                  type: 'expression',
                  literal: 'config.http.host',
                  resolutions: [
                    {
                      type: 'literal',
                      value: 'localhost',
                      literal: "'localhost'",
                    },
                  ],
                },
              },
            ],
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
          type: 'return-value',
          name: 'Fastify',
          from: {
            type: 'library',
            name: 'fastify',
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

  describe('Query Koa.listen', () => {
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
                    resolutions: [],
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
        'with hard-coded port on instance imported via default import',
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
      [
        'with port value from local variable',
        [{ 'index.ts': SOURCE__KOA__PROCESS_ENV_WITH_OR_FALLBACK_FROM_LOCAL_VAR }],
        [
          {
            type: 'symbol',
            name: 'port',
            resolutions: [
              {
                type: 'process-env',
                literal: 'process.env.PORT',
                name: [
                  {
                    type: 'symbol',
                    name: 'PORT',
                    resolutions: [],
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

  describe('Query Express.listen', () => {
    it.each([
      [
        'with literal argument',
        [
          {
            'index.ts': SOURCE__EXPRESS__SINGLE_FILE__VANILLA,
          },
        ],
        [
          {
            type: 'literal',
            literal: '4444',
            value: 4444,
          },
        ],
      ],
      [
        'with process-env and fallback passed to Number()',
        [
          {
            'index.ts': SOURCE__EXPRESS__SINGLE_FILE__PARSED_PROCESS_ENV_WITH_FALLBACK,
          },
        ],
        [
          {
            type: 'expression',
            literal: 'Number(process.env.PORT || 4321)',
            resolutions: [
              {
                type: 'builtin-funcall',
                name: 'Number',
                literal: 'Number(process.env.PORT || 4321)',
                arguments: [
                  {
                    type: 'process-env',
                    literal: 'process.env.PORT',
                    name: [
                      {
                        type: 'symbol',
                        name: 'PORT',
                        resolutions: [],
                      },
                    ],
                  },
                ],
                resolutions: [],
              },
              {
                type: 'literal',
                literal: '4321',
                value: 4321,
              },
            ],
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
          type: 'return-value',
          name: 'express',
          from: {
            type: 'library',
            name: 'express',
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
})
