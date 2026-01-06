import { describe, expect, test } from 'vitest'
import { stepExecutionFixture } from '@whimbrel-test/step-execution-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { MigrateScripts, PNPM__MIGRATE_SCRIPTS } from '@src/tasks'
import { makeFacetScope } from '@whimbrel/facet'
import NpmFacet from '@whimbrel/npm'
import NodeJSFacet from '@whimbrel/node'
import PackageJsonFacet, { PackageJSON } from '@whimbrel/package-json'
import { Actor, ExecutionStep, makeActor, newStepResult } from '@whimbrel/core-api'
import { StepDefinition } from '@whimbrel-test/step-fixtures'
const { stepExecutionTest } = stepExecutionFixture({ describe, expect, test })
const { createDirectory, populateDirectory } = makeTreeFixture(DiskFileSystem)

describe(PNPM__MIGRATE_SCRIPTS, () => {
  stepExecutionTest({
    test: 'should rewrite npm usage in scripts to use pnpm',

    before: async () => {
      const rootPath = await createDirectory([])
      return {
        rootPath,
        actor: makeActor({
          id: 'my-project',
          name: 'my-project',
          root: rootPath,
          facets: {
            npm: makeFacetScope(),
            node: makeFacetScope(),
            'package.json': makeFacetScope(),
          },
        }),
      }
    },

    defineStep: ({ actor }) => {
      return {
        id: MigrateScripts.id,
        bind: {
          target: actor.id,
          key: 'target',
        },
        inputs: {
          target: actor,
        },
        task: MigrateScripts,
      }
    },

    prepareContext: ({ ctx, actor }) => {
      ctx.targets[actor.id] = actor
      ctx.facets.register(NpmFacet)
      ctx.facets.register(NodeJSFacet)
      ctx.facets.register(PackageJsonFacet)
      ctx.stepResult = newStepResult()
    },

    given: async ({ ctx, rootPath }) => {
      await populateDirectory(
        rootPath,
        [
          {
            'package.json': {
              scripts: {
                test: 'npm --workspaces run test --if-present',
                publish: 'npm publish --access private',
              },
            },
          },
        ],
        ctx.disk
      )
    },

    then: async ({ ctx, rootPath }) => {
      const pkgJson = await PackageJSON.read(ctx.disk, rootPath)

      expect(pkgJson.get('scripts')).toEqual({
        test: 'pnpm -r test',
        publish: 'pnpm publish --access private',
      })
    },
  })
})
