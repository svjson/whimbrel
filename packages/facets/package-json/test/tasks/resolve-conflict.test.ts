import { describe, expect, test } from 'vitest'
import { PACKAGE_JSON__RESOLVE_CONFLICT, ResolveConflict } from '@src/index'

import { stepExecutionFixture } from '@whimbrel-test/step-execution-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { PackageJSON } from '@src/index'
import path from 'node:path'
import { newStepResult } from '@whimbrel/core-api'

const { stepExecutionTest } = stepExecutionFixture({ describe, expect, test })

const { createDirectory, populateDirectory } = makeTreeFixture(DiskFileSystem)

describe(PACKAGE_JSON__RESOLVE_CONFLICT, () => {
  const baseTestSetup = {
    before: async () => {
      const rootPath = await createDirectory([])

      const basePath = path.join(rootPath, 'package.base.json')
      const oursPath = path.join(rootPath, 'package.ours.json')
      const theirsPath = path.join(rootPath, 'package.theirs.json')

      return { rootPath, basePath, oursPath, theirsPath }
    },

    defineStep: ({ basePath, oursPath, theirsPath }) => {
      return {
        id: ResolveConflict.id,
        inputs: {
          base: basePath,
          ours: oursPath,
          theirs: theirsPath,
        },
        task: ResolveConflict,
      }
    },

    prepareContext: ({ ctx }) => {
      ctx.stepResult = newStepResult()
    },
  }

  stepExecutionTest({
    test: 'should select highest semver version on version conflict between ours and theirs',

    ...baseTestSetup,

    given: async ({ ctx, rootPath, oursPath, theirsPath, basePath }) => {
      await populateDirectory(
        rootPath,
        [{ 'package.base.json': '@facets/package.json/package.simple.json' }],
        ctx.disk
      )

      const ours = await PackageJSON.read(ctx.disk, basePath)
      ours.set('version', '2.3.12')
      await ours.write(oursPath)

      const theirs = await PackageJSON.read(ctx.disk, basePath)
      theirs.set('version', '2.4.0')
      await theirs.write(theirsPath)
    },

    then: async ({ ctx, oursPath }) => {
      const resultJSON = await PackageJSON.read(ctx.disk, oursPath)
      expect(resultJSON.get('version')).toEqual('2.4.0')
    },
  })

  stepExecutionTest({
    test: 'should select highest semver version and merge non-conflicting changes',

    ...baseTestSetup,

    given: async ({ ctx, rootPath, oursPath, theirsPath, basePath }) => {
      await populateDirectory(
        rootPath,
        [{ 'package.base.json': '@facets/package.json/package.simple.json' }],
        ctx.disk
      )

      const ours = await PackageJSON.read(ctx.disk, basePath)
      ours.set('version', '2.4.1')
      ours.set('dependencies.@koa/cors', '^5.1.0')
      ours.delete('dependencies.koa-bodyparser')
      await ours.write(oursPath)

      const theirs = await PackageJSON.read(ctx.disk, basePath)
      theirs.set('version', '2.4.0')
      theirs.set('dependencies.koa', '^2.16.4')
      theirs.set('devDependencies.ts-node', '^10.10.0')
      await theirs.write(theirsPath)
    },

    then: async ({ ctx, oursPath }) => {
      const resultJSON = await PackageJSON.read(ctx.disk, oursPath)
      expect(resultJSON.getContent()).toEqual({
        name: 'simple-things',
        version: '2.4.1',
        author: 'Benny Boxare',
        scripts: {
          build: 'tsc',
          dev: 'nodemon -e ts,js --exec ts-node -r dotenv/config src/index',
          test: 'vitest run',
        },
        dependencies: {
          '@koa/cors': '^5.1.0',
          '@koa/router': '^12.0.1',
          koa: '^2.16.4',
        },
        devDependencies: {
          '@types/koa': '^2.15.0',
          '@types/koa__cors': '^5.0.0',
          '@types/koa__router': '12.0.4',
          '@types/koa-bodyparser': '^4.3.12',
          '@types/node': '^20.11.5',
          'ts-node': '^10.10.0',
          typescript: '^5.6.2',
        },
      })
    },
  })
})
