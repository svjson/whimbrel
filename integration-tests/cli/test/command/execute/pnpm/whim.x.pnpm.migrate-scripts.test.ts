import { describe, expect, test } from 'vitest'

import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
const { createDirectory } = makeTreeFixture(DiskFileSystem)
import { whimCli } from 'test/whim-fixture'
import { PackageJSON } from '@whimbrel/package-json'

describe('whim x pnpm:migrate-scripts', () => {
  describe('from npm', () => {
    test('updates test and publish scripts using npm', async () => {
      // Given
      const root = await createDirectory([
        {
          'package.json': {
            name: 'some-project',
            scripts: {
              clean: 'rimraf ./dist && rimraf ./node_modules',
              publish: 'npm publish --access public',
              test: 'npm run test:unit && npm run test:integration',
              'test:unit': 'vitest run',
              'test:integration': 'vitest run ./integration',
              typecheck: 'tsc --noEmit',
            },
          },
        },
      ])
      const whim = whimCli(root)

      // When
      await whim.execute(['x', 'pnpm:migrate-scripts'])

      // Then
      const pkgJson = await PackageJSON.read(DiskFileSystem, root)

      expect(pkgJson.get('scripts')).toEqual({
        clean: 'rimraf ./dist && rimraf ./node_modules',
        publish: 'pnpm publish --access public',
        test: 'pnpm test:unit && pnpm test:integration',
        'test:unit': 'vitest run',
        'test:integration': 'vitest run ./integration',
        typecheck: 'tsc --noEmit',
      })
    })
  })
})
