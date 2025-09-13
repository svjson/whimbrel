import path from 'node:path'

import {
  Actor,
  ContextMutator,
  FileEntry,
  makeActor,
  makeTask,
  WhimbrelContext,
  WhimbrelError,
} from '@whimbrel/core-api'
import { resolve } from '@whimbrel/walk'
import { DiskFileSystem } from '@whimbrel/filesystem'

export const SOURCE__DEFINE = 'source:define'

const duplicateGuard = (ctx: WhimbrelContext, root: string, name: string) => {
  const existing = ctx.getActor(name, 'source')
  if (existing) {
    // Same actor - let runner decide consequences
    if (existing.root === root) return name

    let indexed = 1
    while (indexed < 10) {
      const candidate = `${name}-${indexed}`
      if (!ctx.getActor(`name-${indexed}`, 'source')) return candidate
      indexed++
    }
  }

  return name
}

const resolveSourceName = async (
  ctx: WhimbrelContext,
  sourceDefinitions: any | any[]
): Promise<string> => {
  if (!Array.isArray(sourceDefinitions)) sourceDefinitions = [sourceDefinitions]

  for (const sourceDefinition of sourceDefinitions) {
    const explicitName = await resolve('string', ctx, sourceDefinition, 'name')
    if (explicitName) return explicitName

    const sourcePath = await resolve('path', ctx, sourceDefinition, 'path')
    if (sourcePath) {
      const candidate = path.basename(sourcePath)
      return duplicateGuard(ctx, sourcePath, candidate)
    }
  }

  throw new WhimbrelError(
    `Invalid Source Definition: ${JSON.stringify(sourceDefinitions)}`
  )
}

const dryExecute = async (ctx: WhimbrelContext) => {
  await execute(ctx)

  const { source } = ctx

  const importEntries = await DiskFileSystem.scanDir(source.root, {
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

  const actorName = await resolveSourceName(ctx, inputs.source)

  const source: Actor = makeActor({
    id: actorName,
    root: await resolve('path', ctx, inputs, 'source.path'),
    meta: inputs.meta ?? {},
  })

  const mutator = new ContextMutator(ctx)
  mutator.addSource(source)
  mutator.setSource(source)
}

export const Define = makeTask({
  id: SOURCE__DEFINE,
  name: 'Define Source',
  fsMode: 'r',
  bind: {
    inheritSource: false,
  },
  execute,
  dryExecute,
})

export default Define
