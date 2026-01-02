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
  TYPESCRIPT__FASTIFY__SINGLE_FILE__VANILLA_FASTIFY,
} from '@whimbrel-test/asset-fixtures'
import { DefaultFacetRegistry } from '@whimbrel/facet'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('http-adapter:port', () => {
  describe('typescript', () => {
    it.each([
      [
        'hard-coded port',
        TYPESCRIPT__FASTIFY__SINGLE_FILE__VANILLA_FASTIFY,
        {
          primary: { type: 'concrete', value: 2288 },
          fallbacks: [],
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
          fastify: {
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
