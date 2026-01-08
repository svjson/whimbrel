import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test, beforeAll, beforeEach } from 'vitest'
import * as git from 'isomorphic-git'
import * as pennantFixture from './fixtures-pennant'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { whimCli } from 'test/whim-fixture'
import { pennant } from '@whimbrel-test/asset-fixtures'
import { PackageJSON } from '@whimbrel/package-json'

const { prepareGitRepository } = makeTreeFixture(DiskFileSystem)

describe('whim x pnpm:migrate-submodule', () => {
  describe('pennant', () => {
    let root: string

    beforeAll(async () => {
      root = await prepareGitRepository(DiskFileSystem, 'pennant')
    })

    beforeEach(async () => {
      await git.checkout({
        fs,
        dir: root,
        ref: 'HEAD',
        force: true,
      })
    })

    describe('from npm submodule to pnpm submodule', () => {
      test('[packages/backend] updates workspace dependency syntax', async () => {
        // Given
        const modulePath = path.join(root, 'packages', 'backend')
        const whim = whimCli(modulePath)

        // When
        await whim.execute(['x', 'pnpm:migrate-submodule'])

        // Then
        const pkgJson = await PackageJSON.read(DiskFileSystem, modulePath)
        expect(pkgJson.get('dependencies')).toEqual(
          pennantFixture.fromNpm.packages['packages/backend']['package.json'].dependencies
        )
      })

      test('[--submodules] updates workspace dependency syntax in all submodules', async () => {
        // Given
        const whim = whimCli(root)

        // When
        await whim.execute(['x', 'pnpm:migrate-submodule', '--submodules'])

        // Then
        for (const submodulePath of pennant.submodulePaths) {
          const pkgJson = await PackageJSON.read(
            DiskFileSystem,
            path.join(root, submodulePath)
          )
          expect(pkgJson.get('dependencies')).toEqual(
            pennantFixture.fromNpm.packages[submodulePath]['package.json'].dependencies
          )
        }
      })
    })
  })
})
