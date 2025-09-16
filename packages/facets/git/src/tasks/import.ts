import path from 'node:path'

import {
  matchRelative as gitIgnoreMatchRelative,
  readEntries as gitIgnoreReadEntries,
  readEntries,
} from '@whimbrel/gitignore'
import { makeTask, WhimbrelContext, WhimbrelError } from '@whimbrel/core-api'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { beginFlow } from '@whimbrel/flow'

import { makeGitAdapter } from '@src/adapters'
import { GitImportParams, importRepository } from '@src/adapters/git-import'
import { gitReport } from '@src/adapters/whimbrel'

export const GIT__IMPORT = 'git:import'

type ImportFunction = (params: GitImportParams) => Promise<void>

const performImport = async (ctx: WhimbrelContext, importFn: ImportFunction) => {
  const { from, to, source, target } = ctx.step.inputs

  const git = makeGitAdapter(ctx)

  await beginFlow(ctx)
    .let('sourceRepository', await git.repositoryRoot(path.resolve(source.root)))
    .let('sourceRepositoryPath', ({ sourceRepository }) => {
      return path.relative(sourceRepository, from)
    })
    .let('targetRepository', await git.repositoryRoot(path.resolve(target.root)))
    .let('targetRepositoryPath', ({ targetRepository }) => {
      if (!targetRepository) return null
      return path.relative(targetRepository, to)
    })
    .do(importFn)
    .run()
}

const execute = async (ctx: WhimbrelContext) => {
  const git = makeGitAdapter(ctx)

  await performImport(ctx, async (params) => {
    Object.entries(params).forEach(([key, val]) => {
      if (val === null) {
        throw new WhimbrelError(`Could not resolve '${key}'`)
      }
    })
    const { targetRepository } = params
    await gitReport(ctx, git, targetRepository, async () => {
      await importRepository(ctx, params)
    })
  })
}

const dryExecute = async (ctx: WhimbrelContext) => {
  await performImport(
    ctx,
    async ({
      sourceRepository,
      sourceRepositoryPath,
      targetRepository,
      targetRepositoryPath,
    }) => {
      for (const pt of [
        sourceRepository,
        sourceRepositoryPath,
        targetRepository,
        targetRepositoryPath,
      ]) {
        if (pt === null) {
          return
        }
      }

      const absSourcePath = path.join(sourceRepository, sourceRepositoryPath)
      const absTargetPath = path.join(targetRepository, targetRepositoryPath)

      if (await ctx.disk.exists(absTargetPath)) {
        ctx.log.info(' - Import Repository: Target exists. Skipping.')
        return
      }

      ctx.log.info(
        ` - Import Repository: Importing ${sourceRepositoryPath} to ${targetRepositoryPath}.`
      )

      let ignoreFiles = ['.git']
      if (await DiskFileSystem.exists(path.join(sourceRepository, '.gitignore'))) {
        ignoreFiles = [
          ...ignoreFiles,
          ...(await readEntries(DiskFileSystem, sourceRepository)),
        ]
      }

      if (absSourcePath !== sourceRepository) {
        if (await DiskFileSystem.exists(path.join(absSourcePath, '.gitignore'))) {
          ignoreFiles = [
            ...ignoreFiles,
            ...(await gitIgnoreReadEntries(DiskFileSystem, absSourcePath)),
          ]
        }
      }

      const importFiles = await DiskFileSystem.scanDir(absSourcePath, {
        ignorePredicate: (diskEntry) => {
          return ignoreFiles.some((pattern) =>
            gitIgnoreMatchRelative(absSourcePath, diskEntry, pattern)
          )
        },
      })

      importFiles.sort((a, b) => a.path.localeCompare(b.path))

      const changeset = []
      for (const entry of importFiles) {
        const relativePath = path.relative(absSourcePath, entry.path)
        const importPath = path.join(targetRepository, targetRepositoryPath, relativePath)
        if (entry.type === 'file') {
          await ctx.disk.writeReference(importPath, entry.path, { silent: true })
          changeset.push(path.join(targetRepositoryPath, relativePath))
        } else if (!(await ctx.disk.exists(importPath))) {
          await ctx.disk.mkdir(importPath, { recursive: true, silent: true })
        }
      }

      const git = makeGitAdapter(ctx)

      await git.stage(
        targetRepository,
        changeset.map((f) => [f, 0, 1, 0])
      )
      await git.commit(targetRepository, {
        message: `Import of '${path.basename(targetRepositoryPath)}' as package at ./${targetRepositoryPath}`,
        report: true,
      })
    }
  )
}

export const Import = makeTask({
  id: GIT__IMPORT,
  name: 'Import Git Repository',
  execute,
  dryExecute,
  fsMode: 'rw',
  parameters: {
    from: {
      type: 'string',
      required: true,
    },
    to: {
      type: 'string',
      required: true,
    },
    source: {
      type: 'actor',
      required: true,
      resolvers: [{ path: '@from', type: 'source' }],
      defaults: [{ ref: 'source' }],
    },
    target: {
      type: 'actor',
      required: true,
      resolvers: [{ path: '@to', type: 'target' }],
      defaults: [{ ref: 'target' }],
    },
  },
})
