import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { ContextMutator, makeActor } from '@whimbrel/core-api'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import { WorkspaceAdapter } from '@src/index'
import { PackageJSON } from '@src/index'

import { makeTreeFixture } from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('WorkspaceAdapter', () => {
  describe('getSubModulePackageJSON', () => {
    it('should return PackageJSON of submodule when it exists', async () => {
      // Given
      const ctx = await memFsContext()

      const rootDir = await createDirectory(
        [
          { 'package.json': { name: 'whimbrel-root' } },
          [
            'packages',
            [
              ['cli', [{ 'package.json': { name: 'whimbrel' } }]],
              [
                'facets',
                [
                  ['actor', [{ 'package.json': { name: 'actor' } }]],
                  ['source', [{ 'package.json': { name: 'source' } }]],
                ],
              ],
            ],
          ],
        ],
        ctx.disk
      )

      const rootActor = makeActor({
        id: 'whimbrel',
        name: 'whimbrel-root',
        root: rootDir,
        subModules: ['cli', 'actor', 'source'],
      })
      const cliActor = makeActor({
        id: 'cli',
        name: 'whimbrel',
        root: path.join(rootDir, 'packages', 'cli'),
      })
      const actorActor = makeActor({
        id: 'actor',
        name: '@whimbrel/actor',
        root: path.join(rootDir, 'packages', 'facets', 'actor'),
      })
      const sourceActor = makeActor({
        id: 'source',
        name: '@whimbrel/source',
        root: path.join(rootDir, 'packages', 'facets', 'source'),
      })

      const mutator = new ContextMutator(ctx)
      mutator.addTarget(rootActor)
      mutator.addTarget(cliActor)
      mutator.addTarget(actorActor)
      mutator.addTarget(sourceActor)
      const ws = new WorkspaceAdapter(
        ctx,
        rootActor,
        await PackageJSON.read(ctx.disk, rootActor.root)
      )

      // When
      const subPackageJson = await ws.getSubModulePackageJSON('actor')
      expect(subPackageJson).toBeInstanceOf(PackageJSON)

      // Then
      expect(subPackageJson.getPath()).toEqual(path.join(actorActor.root, 'package.json'))
      expect(subPackageJson.getContent()).toEqual({
        name: 'actor',
      })
    })
  })

  describe('getInternalDependencies', () => {
    it('should filter dependency collection on package names that are submodules to main actor', async () => {
      // Given
      const rootActor = makeActor({
        id: 'whimbrel',
        name: 'whimbrel-root',
        root: '/tmp/whimbrel',
        subModules: ['cli', 'actor', 'source'],
      })
      const cliActor = makeActor({
        id: 'cli',
        name: 'whimbrel',
        root: '/tmp/whimbrel/packages/cli',
      })
      const actorActor = makeActor({
        id: 'actor',
        name: '@whimbrel/actor',
        root: '/tmp/whimbrel/packages/facets/actor',
      })
      const sourceActor = makeActor({
        id: 'source',
        name: '@whimbrel/source',
        root: '/tmp/whimbrel/packages/facets/source',
      })

      const ctx = await memFsContext({
        sources: {
          whimbrel: rootActor,
          cli: cliActor,
          actor: actorActor,
          source: sourceActor,
        },
      })

      const ws = new WorkspaceAdapter(
        ctx,
        rootActor,
        new PackageJSON({
          content: {},
        })
      )

      // When
      const internalDeps = ws.getInternalDependencies({
        '@whimbrel/actor': '^0.0.3',
        'fast-deep-equal': '^3.1.3',
        whimbrel: '^0.0.3',
        '@whimbrel/source': '^0.0.2',
        vitest: '^3.2.4',
      })

      // Then
      expect(internalDeps).toEqual({
        '@whimbrel/actor': '^0.0.3',
        whimbrel: '^0.0.3',
        '@whimbrel/source': '^0.0.2',
      })
    })
  })
})
