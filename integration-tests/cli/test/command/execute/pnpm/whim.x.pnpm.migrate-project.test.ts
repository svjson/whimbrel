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

describe('pennant', () => {
  let root: string

  beforeAll(async () => {
    root = await prepareGitRepository(DiskFileSystem, 'pennant')
  })

  describe('from npm', () => {
    beforeEach(async () => {
      await git.checkout({
        fs,
        dir: root,
        ref: 'HEAD',
        force: true,
      })
    })

    test('whim x pnpm:migrate-submodule', async () => {
      // Given
      const whim = whimCli(root)

      // When
      await whim.execute(['x', 'pnpm:migrate-project'])

      // Then
      // ...packageManager has been set
      const pkgJson = await PackageJSON.read(DiskFileSystem, root)
      expect(pkgJson.getPackageManager().name).toEqual('pnpm')

      // ...workspaces entry has been removed
      expect(pkgJson.get('workspaces')).toBeUndefined()

      // ...scripts have been rewritten
      expect(pkgJson.get('scripts')).toEqual(
        pennantFixture.fromNpm.rootModule['package.json'].scripts
      )

      // ...pnpm-workspace.yaml has been created
      const pnpmWsPath = path.join(root, 'pnpm-workspace.yaml')
      expect(await DiskFileSystem.exists(pnpmWsPath)).toBe(true)
      expect(await DiskFileSystem.read(pnpmWsPath, 'utf8')).toEqual(
        pennantFixture.fromNpm.rootModule['pnpm-workspace-yaml']
      )

      // ...submodule workspace dependencies have been updated
      const submodulePkgJsonContent = []
      for (const submodulePath of pennant.submodulePaths) {
        const subPkgJson = await PackageJSON.read(
          DiskFileSystem,
          path.join(root, submodulePath)
        )
        expect(subPkgJson.get('dependencies')).toEqual(
          pennantFixture.fromNpm.packages[submodulePath]['package.json'].dependencies
        )
        submodulePkgJsonContent.push(subPkgJson.getContent())
      }

      // Snapshots
      expect(pkgJson.getContent()).toMatchSnapshot()
      submodulePkgJsonContent.forEach((json) => {
        expect(json).toMatchSnapshot()
      })
    })
  })
})
