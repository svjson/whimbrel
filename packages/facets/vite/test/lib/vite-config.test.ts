import { describe, it, expect } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture, { asset } from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
const { createDirectory } = makeTreeFixture(DiskFileSystem)

import { TYPESCRIPT__VITE_CONFIG__REACT_SERVER_PROXY__LAMBDA } from '@whimbrel-test/asset-fixtures'
import { parseViteConfiguration } from '@src/lib/vite-config'

describe('parseViteConfiguration', () => {
  it('should extract port config from TypeScript/defineConfig with lambda', async () => {
    const ctx = await memFsContext()

    const root = await createDirectory(
      [{ 'vite.config.ts': asset(TYPESCRIPT__VITE_CONFIG__REACT_SERVER_PROXY__LAMBDA) }],
      ctx.disk
    )

    // When
    const config = await parseViteConfiguration(ctx, root)

    // Then
    expect(config).toEqual({
      server: {
        port: 3000,
      },
    })
  })
})
