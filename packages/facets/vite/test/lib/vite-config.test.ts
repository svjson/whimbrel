import { describe, it, expect } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture, { asset } from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
const { createDirectory } = makeTreeFixture(DiskFileSystem)

import {
  TYPESCRIPT__VITE_CONFIG__REACT_SERVER_PROXY__LAMBDA,
  TYPESCRIPT__VITE_CONFIG__REACT_SERVER_PROXY_TEST,
} from '@whimbrel-test/asset-fixtures'
import { parseViteConfiguration } from '@src/lib/vite-config'

describe('parseViteConfiguration', () => {
  it.each([
    {
      case: 'port config from TypeScript/defineConfig with lambda',
      viteConfig: asset(TYPESCRIPT__VITE_CONFIG__REACT_SERVER_PROXY__LAMBDA),
      expected: {
        server: {
          port: 3000,
        },
      },
    },
    {
      case: 'port config from TypeScript/defineConfig object',
      viteConfig: asset(TYPESCRIPT__VITE_CONFIG__REACT_SERVER_PROXY_TEST),
      expected: {
        server: {
          port: 7003,
        },
      },
    },
  ])('should extract $case', async ({ viteConfig, expected }) => {
    const ctx = await memFsContext()

    const root = await createDirectory([{ 'vite.config.ts': viteConfig }], ctx.disk)

    // When
    const config = await parseViteConfiguration(ctx, root)

    // Then
    expect(config).toEqual(expected)
  })
})
