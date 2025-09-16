import { VCSFileEntry } from '@whimbrel/core-api'
import { FsClient } from 'isomorphic-git'
import {
  ChangesetMatrix,
  CommitEntry,
  GitAdapter,
  GitCommitOptions,
  GitOid,
  GitUser,
  LogOptions,
  RepositoryStatus,
  StatusFilter,
} from '../git-adapter'
import {
  changedFiles,
  commit,
  currentBranch,
  head,
  log,
  repositoryRoot,
  repositoryUser,
  repositoryStatus,
  stage,
  status,
  readCommit,
} from './impl'

export const makeIsoMorphicGitAdapter = (fs: FsClient): GitAdapter => {
  return {
    async commit(repoRoot: string, opts?: GitCommitOptions) {
      return commit(fs, repoRoot, opts)
    },

    async changedFiles(
      repoRoot: string,
      fromOid: GitOid,
      toOid: string
    ): Promise<VCSFileEntry[]> {
      return changedFiles(fs, repoRoot, fromOid, toOid)
    },

    async currentBranch(repoRoot: string): Promise<string> {
      return currentBranch(fs, repoRoot)
    },

    async log(repoRoot: string, opts: LogOptions): Promise<CommitEntry[]> {
      return log(fs, repoRoot, opts)
    },

    async head(repoRoot: string): Promise<string | null> {
      return head(fs, repoRoot)
    },

    async readCommit(repoRoot: string, oid: GitOid): Promise<CommitEntry> {
      return readCommit(fs, repoRoot, oid)
    },

    async repositoryRoot(dir: string): Promise<string | null> {
      return repositoryRoot(fs, dir)
    },

    async repositoryUser(dir: string): Promise<GitUser | null> {
      return repositoryUser(fs, dir)
    },

    async status(repoRoot: string, filter?: StatusFilter): Promise<ChangesetMatrix> {
      return status(fs, repoRoot, filter)
    },

    async repositoryStatus(dir: string): Promise<[RepositoryStatus, ChangesetMatrix]> {
      return repositoryStatus(fs, dir)
    },

    async stage(repoRoot: string, files?: any): Promise<void> {
      return stage(fs, repoRoot, files)
    },
  }
}
