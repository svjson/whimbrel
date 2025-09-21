import path from 'node:path'
import fs from 'node:fs'
import { tmpdir } from 'node:os'

import { NoDryExecutionError, WhimbrelContext } from '@whimbrel/core-api'
import { parseGitMergeOutput } from './git-adapter'
import { FileSystemMutationReporter } from '@whimbrel/filesystem'
import { currentBranch } from './isomorphic-git/impl'

export interface GitImportParams {
  sourceRepository: string
  sourceRepositoryPath: string
  targetRepository: string
  targetRepositoryPath: string
}

function normalizeBranch(branch: string): string {
  return branch.replace(/^refs\/heads\//, '')
}

export const importRepository = async (
  ctx: WhimbrelContext,
  {
    sourceRepository,
    sourceRepositoryPath,
    targetRepository,
    targetRepositoryPath,
  }: GitImportParams
) => {
  if (ctx.dryRun) {
    throw new NoDryExecutionError('git-adapter.js', 'importRepository')
  }

  const absSourcePath = path.join(sourceRepository, sourceRepositoryPath)
  const absTargetPath = path.join(targetRepository, targetRepositoryPath)

  const targetBranch = normalizeBranch(await currentBranch(fs, targetRepository))
  const repoName = path.basename(sourceRepository)

  ctx.log.info(`Source root is: ${sourceRepository}`)

  if (fs.existsSync(absTargetPath)) {
    ctx.log.info(' - Import Repository: Target exists. Skipping.')
    return
  }
  ctx.log.info(` - Import Repository: Importing ${absSourcePath} to ${absTargetPath}.`)

  const mergeMessage = `Import of '${repoName}' as package at ${targetRepositoryPath}`

  const tmpDir = fs.mkdtempSync(path.join(tmpdir(), 'whim-git-import-'))
  ctx.log.info(' - Cloning into temporary repository')
  await ctx.runCommand(
    tmpDir,
    `git clone --no-tags --no-local ${sourceRepository} temp-repo`
  )
  const tempRepo = path.join(tmpDir, 'temp-repo')
  const tmpBranch = `import/${repoName}`

  ctx.log.info(` - Filter repo path ${targetRepositoryPath}`)
  const subDirFilter = sourceRepositoryPath
    ? `--subdirectory-filter ${sourceRepositoryPath}`
    : ''
  const toSubDirFilter = `--to-subdirectory-filter ${targetRepositoryPath}`

  await ctx.runCommand(
    tempRepo,
    `git-filter-repo ${[subDirFilter, toSubDirFilter].join(' ')}`
  )

  await ctx.runCommand(tempRepo, `git remote add monorepo ${targetRepository}`)
  await ctx.runCommand(tempRepo, 'git fetch monorepo')
  await ctx.runCommand(tempRepo, `git checkout -b ${tmpBranch}`)
  await ctx.runCommand(
    tempRepo,
    `git merge monorepo/${targetBranch} --allow-unrelated-histories`
  )
  await ctx.runCommand(tempRepo, `git push monorepo HEAD:${tmpBranch}`)

  await ctx.runCommand(targetRepository, `git checkout ${targetBranch}`)
  ctx.log.info(` - Merge temporary branch to ${targetBranch}`)
  const [mergeStdOut] = await ctx.runCommand(
    targetRepository,
    `git merge --no-ff -m "${mergeMessage}" ${tmpBranch}`
  )

  const files = parseGitMergeOutput(mergeStdOut)
  ctx.log.info(` - Imported ${files.length} files with commit history from ${repoName}`)
  const reporter = new FileSystemMutationReporter(ctx)
  files.forEach((filePath) => reporter.fileCreated(path.join(targetRepository, filePath)))
}
