import path from 'node:path'

import {
  makeVCSEvent,
  VCSEventDetails,
  VCSFileEntry,
  VCSMutation,
  VCSMutationType,
  WhimbrelContext,
  WhimbrelError,
} from '@whimbrel/core-api'
import {
  ChangesetMatrix,
  CommitEntry,
  GitAdapter,
  GitCommitOptions,
  GitOid,
  GitUser,
  LogOptions,
  ReadCommitOptions,
  RepositoryStatus,
  StatusFilter,
} from './git-adapter'
import { StatusRow } from 'isomorphic-git'

export const makeWhimbrelGitAdapter = (
  ctx: WhimbrelContext,
  adapter: GitAdapter
): GitAdapter => {
  return {
    async commit(repoRoot: string, params: GitCommitOptions = {}): Promise<string> {
      const commitHash = await adapter.commit(repoRoot, params)

      const { report } = params
      if (report) {
        await reportCommit(ctx, adapter, repoRoot, commitHash)
      }
      return commitHash
    },
    async changedFiles(
      repoRoot: string,
      fromOid: GitOid,
      toOid: string
    ): Promise<VCSFileEntry[]> {
      return adapter.changedFiles(repoRoot, fromOid, toOid)
    },
    async currentBranch(repoRoot: string): Promise<string> {
      return adapter.currentBranch(repoRoot)
    },
    async log(repoRoot: string, opts: LogOptions): Promise<CommitEntry[]> {
      return adapter.log(repoRoot, opts)
    },
    async head(repoRoot: string): Promise<string | null> {
      return adapter.head(repoRoot)
    },
    async readCommit(repoRoot: string, oid: GitOid, opts?: ReadCommitOptions) {
      return adapter.readCommit(repoRoot, oid, opts)
    },
    async repositoryRoot(dir: string): Promise<string | null> {
      return adapter.repositoryRoot(await findExistingDir(ctx, dir))
    },
    async repositoryUser(dir: string): Promise<GitUser | null> {
      return adapter.repositoryUser(dir)
    },
    async status(repoRoot: string, filter?: StatusFilter): Promise<ChangesetMatrix> {
      if (!(await ctx.disk.exists(repoRoot))) {
        return []
      }
      return adapter.status(repoRoot, filter)
    },
    async repositoryStatus(dir: string): Promise<[RepositoryStatus, ChangesetMatrix]> {
      return adapter.repositoryStatus(dir)
    },
    async stage(repoRoot: string, files?: any): Promise<void> {
      return adapter.stage(repoRoot, files)
    },
  }
}

const findExistingDir = async (ctx: WhimbrelContext, dir: string) => {
  if (!(await ctx.disk.exists(dir))) {
    const parent = path.dirname(dir)
    if (parent === dir) {
      return null
    }
    return await findExistingDir(ctx, parent)
  }

  return dir
}

export const gitMutation = (
  type: VCSMutationType,
  repository: string,
  details: Partial<VCSEventDetails> = {}
): VCSMutation => ({
  mutationType: 'vcs',
  vcs: 'git',
  type,
  repository,
  ...details,
})

export const reportCommit = async (
  ctx: WhimbrelContext,
  adapter: GitAdapter,
  repoRoot: string,
  commit: string | CommitEntry
) => {
  commit =
    typeof commit === 'string' ? await adapter.readCommit(repoRoot, commit) : commit

  const branch = await adapter.currentBranch(repoRoot)

  ctx.emitEvent(
    makeVCSEvent(
      gitMutation('commit', repoRoot, {
        ...commit,
        branch,
      })
    )
  )
}

export const gitReport = async (
  ctx: WhimbrelContext,
  adapter: GitAdapter,
  repoPath: string,
  action: (matrix?: StatusRow[]) => Promise<void>
) => {
  const [before, matrix] = await adapter.repositoryStatus(repoPath)
  await action(matrix)
  const [after] = await adapter.repositoryStatus(repoPath)
  await gitReportStatus(ctx, adapter, { before, after })
}

export const gitReportStatus = async (
  ctx: WhimbrelContext,
  adapter: GitAdapter,
  { before, after }: { before: RepositoryStatus; after: RepositoryStatus }
) => {
  if (before.root !== after.root) {
    throw new WhimbrelError(
      `gitReportStatus: ${before.root} and ${after.root} are different repositories!`
    )
  }

  if (!before.initialized && after.initialized) {
    ctx.emitEvent(
      makeVCSEvent(gitMutation('init', before.root, { branch: after.branch }))
    )
  } else if (before.initialized && !after.initialized) {
    ctx.emitEvent(makeVCSEvent(gitMutation('de-init', before.root)))
  }

  if (before.head !== after.head && after.head) {
    const commits = await adapter.log(before.root, {
      branch: after.branch,
      since: before.head,
      until: after.head,
      changeset: true,
    })
    commits.forEach((ci) => {
      ctx.emitEvent(makeVCSEvent(gitMutation('commit', before.root, ci)))
    })
  }
}
