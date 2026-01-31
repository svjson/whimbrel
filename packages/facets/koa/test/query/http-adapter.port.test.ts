import { describe, expect, it } from 'vitest'

import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture, { asset } from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import TypeScriptFacet from '@whimbrel/typescript'
import TsConfigJSONFacet from '@whimbrel/tsconfig-json'

import { queryHttpAdapterPort } from '@src/query/http-adapter.port'
import { makeActor } from '@whimbrel/core-api'

import {
  TSCONFIG_JSON__VANILLA,
  TYPESCRIPT__KOA__SINGLE_FILE__PROCESS_ARG_WITH_OR_FALLBACK,
  TYPESCRIPT__KOA__SINGLE_FILE__PROCESS_ENV_WITH_OR_FALLBACK,
  TYPESCRIPT__KOA__SINGLE_FILE__PROCESS_ENV_WITH_OR_FALLBACK_FROM_LOCAL_VAR,
  TYPESCRIPT__KOA__SINGLE_FILE__VANILLA_KOA,
} from '@whimbrel-test/asset-fixtures'
import { DefaultFacetRegistry } from '@whimbrel/facet'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('http-adapter:port', () => {
  describe('typescript', () => {
    it.each([
      [
        'hard-coded port',
        TYPESCRIPT__KOA__SINGLE_FILE__VANILLA_KOA,
        {
          primary: { type: 'concrete', value: 4444 },
          fallbacks: [],
        },
      ],
      [
        'process argument and fallback',
        TYPESCRIPT__KOA__SINGLE_FILE__PROCESS_ARG_WITH_OR_FALLBACK,
        {
          primary: { type: 'process-arg', index: [{ type: 'concrete', value: 1 }] },
          fallbacks: [{ type: 'concrete', value: 4444 }],
        },
      ],
      [
        'env variable and fallback',
        TYPESCRIPT__KOA__SINGLE_FILE__PROCESS_ENV_WITH_OR_FALLBACK,
        {
          primary: { type: 'env', name: [{ type: 'symbol', name: 'PORT' }] },
          fallbacks: [{ type: 'concrete', value: 4433 }],
        },
      ],
      [
        'env variable and fallback via local variable',
        TYPESCRIPT__KOA__SINGLE_FILE__PROCESS_ENV_WITH_OR_FALLBACK_FROM_LOCAL_VAR,
        {
          primary: { type: 'env', name: [{ type: 'symbol', name: 'PORT' }] },
          fallbacks: [{ type: 'concrete', value: 4433 }],
        },
      ],
    ])('should resolve', async (_, sourceFile, expectedResult) => {
      // Given
      const ctx = await memFsContext({
        facets: new DefaultFacetRegistry([TypeScriptFacet, TsConfigJSONFacet]),
      })
      const root = await createDirectory(
        [
          { 'tsconfig.json': asset(TSCONFIG_JSON__VANILLA) },
          ['src', [{ 'index.ts': asset(sourceFile) }]],
        ],
        ctx.disk
      )
      ctx.sources['my-project'] = makeActor({
        id: 'my-project',
        root: root,
        facets: {
          typescript: {
            roles: ['language'],
            config: {},
          },
          koa: {
            roles: ['http-adapter'],
            config: {},
          },
          'tsconfig.json': {
            roles: ['build-config'],
            config: {
              path: `${root}/tsconfig.json`,
            },
          },
        },
      })

      // When
      const result = await queryHttpAdapterPort(ctx, {
        type: 'http-adapter:port',
        actor: ctx.sources['my-project'],
      })

      // Then
      expect(result).toEqual(expectedResult)
    })
  })
})
