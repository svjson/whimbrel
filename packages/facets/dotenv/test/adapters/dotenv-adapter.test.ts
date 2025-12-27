import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { describe, expect, it } from 'vitest'
import { DotEnvFile } from '@src/index'
import path from 'node:path'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('DotEnvFile', () => {
  describe('read and write', () => {
    it('should read file from storage and write changes', async () => {
      // Given
      const ctx = await memFsContext()
      const dirRoot = await createDirectory(
        [
          {
            '.env': `
HTTP__PORT=8080
HTTP__BASE_URI=/api
`,
          },
        ],
        ctx.disk
      )
      const envFile = await DotEnvFile.read(ctx.disk, [dirRoot, '.env'])

      // When
      envFile.set('HTTP__PORT', 7171)
      await envFile.write()

      // Then
      expect(await ctx.disk.read(path.join(dirRoot, '.env'), 'utf8')).toEqual(`
HTTP__PORT=7171
HTTP__BASE_URI=/api
`)
    })
  })
})
