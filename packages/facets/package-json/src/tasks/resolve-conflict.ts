import equal from 'fast-deep-equal'

import { makeTask, WhimbrelContext, WhimbrelError } from '@whimbrel/core-api'
import { diff3Way } from '@whimbrel/walk'

import { PackageJSON } from '@src/adapters'
import { highestVersion } from '@src/lib/semver'
import path from 'node:path'

export const PACKAGE_JSON__RESOLVE_CONFLICT = 'package.json:resolve-conflict'

const readFiles = async (
  ctx: WhimbrelContext,
  fileVersionPaths: { ours: string; theirs: string; base: string }
) => {
  const { ours: oursPath, theirs: theirsPath, base: basePath } = fileVersionPaths

  const files = await Promise.all(
    [oursPath, theirsPath, basePath].map(async (filePath) => {
      const fPath = path.resolve(filePath)
      return {
        path: fPath,
        json: await PackageJSON.readIfExists(ctx.disk, fPath),
      }
    })
  )

  const missingFiles = files.reduce((missing: string[], { path, json }) => {
    if (!json) {
      missing.push(path)
    }
    return missing
  }, [] as string[])

  if (missingFiles.length) {
    throw new WhimbrelError(`One more input files could not be read: ${missingFiles}`)
  }
  return files
}

const execute = async (ctx: WhimbrelContext) => {
  const [ours, theirs, base] = await readFiles(ctx, ctx.step.inputs)

  const diff = diff3Way(
    ours.json.getContent(),
    theirs.json.getContent(),
    base.json.getContent()
  )

  const merged = base.json

  for (const entry of diff) {
    if (entry.conflict) {
      if (equal(['version'], entry.path)) {
        const highest = highestVersion(entry.a, entry.b)
        merged.set('version', highest)
      } else {
        throw new WhimbrelError(
          `Cannot resolve conflict "${entry.path.join('.')}": ${entry.a} vs ${entry.b}`
        )
      }
    } else {
      ;['a', 'b'].forEach((side, i) => {
        switch (entry.types[i]) {
          case 'unchanged':
            break
          case 'add':
          case 'modify':
            merged.set(entry.path, entry[side])
            break
          case 'remove':
            merged.delete(entry.path)
            break
        }
      })
    }
  }

  await merged.write(ours.path)
}

export const ResolveConflict = makeTask({
  id: PACKAGE_JSON__RESOLVE_CONFLICT,
  name: 'Resolve package.json merge conlict',
  fsMode: 'rw',
  execute: execute,
  parameters: {
    ours: {
      type: 'string',
      required: true,
    },
    theirs: {
      type: 'string',
      required: true,
    },
    base: {
      type: 'string',
      required: true,
    },
  },
})
