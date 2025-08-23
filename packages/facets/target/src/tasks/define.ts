import path from 'node:path'

import {
  Actor,
  ContextMutator,
  FileEntry,
  makeTask,
  WhimbrelContext,
  WhimbrelError,
} from '@whimbrel/core-api'
import { resolve } from '@whimbrel/walk'
import { DiskFileSystem } from '@whimbrel/filesystem'

export const TARGET__DEFINE = 'target:define'

const resolveTargetName = async (
  ctx: WhimbrelContext,
  targetDefinitions: any | any[]
): Promise<string> => {
  if (!Array.isArray(targetDefinitions)) targetDefinitions = [targetDefinitions]

  for (const targetDefinition of targetDefinitions) {
    const explicitName = await resolve('string', ctx, targetDefinition, 'name')
    if (explicitName) return explicitName

    const sourcePath = await resolve('path', ctx, targetDefinition, 'path')
    if (sourcePath) {
      return path.basename(sourcePath)
    }
  }

  throw new WhimbrelError(
    `Invalid Source Definition: ${JSON.stringify(targetDefinitions)}`
  )
}

const dryExecute = async (ctx: WhimbrelContext) => {
  await execute(ctx)

  const { target } = ctx

  const importEntries = await DiskFileSystem.scanDir(target.root, {
    sort: true,
    ignorePredicate: (entry: FileEntry) => {
      return path.basename(entry.path) === 'node_modules'
    },
  })

  const opts = { silent: true, report: false }
  for (const entry of importEntries) {
    switch (entry.type) {
      case 'file':
        await ctx.disk.writeReference(entry.path, entry.path, opts)
        break
      case 'directory':
        if (!(await ctx.disk.exists(entry.path))) {
          await ctx.disk.mkdir(entry.path, opts)
        }
        break
    }
  }
}

const execute = async (ctx: WhimbrelContext) => {
  const { inputs } = ctx.step

  const actorName = await resolveTargetName(ctx, inputs.target)

  const target: Actor = {
    id: actorName,
    name: actorName,
    root: await resolve('path', ctx, inputs, 'target.path'),
    meta: inputs.meta ?? {},
    facets: {},
  }

  const mutator = new ContextMutator(ctx)
  mutator.addTarget(target)
  mutator.setTarget(target)
}

export const Define = makeTask({
  id: TARGET__DEFINE,
  name: 'Define Target',
  bind: {
    inheritTarget: false,
  },
  execute,
  dryExecute,
})

export default Define
