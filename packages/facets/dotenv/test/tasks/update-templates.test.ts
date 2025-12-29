import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { stepExecutionFixture } from '@whimbrel-test/step-execution-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { makeFacetScope } from '@whimbrel/facet'
import { DiskFileSystem } from '@whimbrel/filesystem'

import { UpdateTemplates, DOTENV__UPDATE_TEMPLATES } from '@src/index'
import { makeActor, newStepResult } from '@whimbrel/core-api'

const { createDirectory } = makeTreeFixture(DiskFileSystem)
const { stepExecutionTest } = stepExecutionFixture({ describe, expect, test })

describe(DOTENV__UPDATE_TEMPLATES, () => {
  stepExecutionTest({
    test: 'should not update .env.template when identical to .env',

    before: async () => {
      const rootPath = await createDirectory([
        { '.env': '@facets/dotenv/simple-http-service.env' },
        { '.env.template': '@facets/dotenv/simple-http-service.env' },
      ])

      return {
        rootPath,
        actor: makeActor({
          id: 'my-project',
          root: rootPath,
          facets: {
            dotenv: makeFacetScope({
              config: {
                root: rootPath,
                files: ['.env', '.env.template'],
              },
            }),
          },
        }),
      }
    },

    defineStep: ({ actor }) => {
      return {
        id: UpdateTemplates.id,
        inputs: {
          target: actor,
        },
        task: UpdateTemplates,
      }
    },

    prepareContext: ({ ctx, actor }) => {
      ctx.targets[actor.id] = actor
      ctx.stepResult = newStepResult()
    },

    then: async ({ ctx, rootPath }) => {
      expect(ctx.stepResult).toEqual({
        journal: [
          {
            origin: 'flow',
            payload: {
              name: 'files',
              value: '.env, .env.template',
            },
            private: false,
            type: 'let',
          },
          {
            origin: 'flow',
            payload: {
              name: 'profiles',
              value: ['.env'],
            },
            private: false,
            type: 'let',
          },
        ],
        mutations: {
          vcs: [],
          ctx: [],
          fs: [],
        },
      })

      expect(await ctx.disk.read(path.join(rootPath, '.env'), 'utf8')).toEqual(
        await ctx.disk.read(path.join(rootPath, '.env.template'), 'utf8')
      )
    },
  })

  stepExecutionTest({
    test: 'should not write missing properties to .env.template',

    before: async () => {
      const rootPath = await createDirectory([
        { '.env': '@facets/dotenv/http-service-with-downstreams-service.env' },
        { '.env.template': '@facets/dotenv/simple-http-service.env' },
      ])

      return {
        rootPath,
        actor: makeActor({
          id: 'my-project',
          root: rootPath,
          facets: {
            dotenv: makeFacetScope({
              config: {
                root: rootPath,
                files: ['.env', '.env.template'],
              },
            }),
          },
        }),
      }
    },

    defineStep: ({ actor }) => {
      return {
        id: UpdateTemplates.id,
        inputs: {
          target: actor,
        },
        task: UpdateTemplates,
      }
    },

    prepareContext: ({ ctx, actor }) => {
      ctx.targets[actor.id] = actor
      ctx.stepResult = newStepResult()
    },

    then: async ({ ctx, rootPath }) => {
      expect(ctx.stepResult).toEqual({
        journal: [
          {
            origin: 'flow',
            payload: {
              name: 'files',
              value: '.env, .env.template',
            },
            private: false,
            type: 'let',
          },
          {
            origin: 'flow',
            payload: {
              name: 'profiles',
              value: ['.env'],
            },
            private: false,
            type: 'let',
          },
        ],
        mutations: {
          vcs: [],
          ctx: [],
          fs: [
            {
              mutationType: 'fs',
              object: 'file',
              path: path.join(rootPath, '.env.template'),
              type: 'modify',
            },
          ],
        },
      })

      const envTemplateLines = (
        (await ctx.disk.read(path.join(rootPath, '.env.template'), 'utf8')) as string
      ).split('\n')

      expect(envTemplateLines).toContain('HTTP__PORT=8080')
      expect(envTemplateLines).toContain('HTTP__CONTEXT_ROOT=/api')
      expect(envTemplateLines).toContain('BACKEND_API__URL=')
      expect(envTemplateLines).toContain('BACKEND_API__SECRET=')
    },
  })
})
