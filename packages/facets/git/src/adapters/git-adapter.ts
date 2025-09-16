import { VCSFileEntry } from '@whimbrel/core-api'
import { StatusRow } from 'isomorphic-git'

export interface GitUser {
  name: string
  email?: string
}

export interface GitCommitOptions {
  message?: string
  // This should only be available on the Whimbrel-implementation, right?
  report?: boolean
}

export interface ReadCommitOptions {
  withChangeset?: boolean
}

export type ChangesetMatrix = StatusRow[]

export type GitOid = string

export type StatusFilter = (row: StatusRow) => boolean

export interface RepositoryStatus {
  root: string
  initialized: boolean
  branch?: string
  staged: string[]
  untracked: string[]
  unstaged: string[]
  head?: string
}

export interface LogOptions {
  branch?: string
  since
  until
  changeset
}

export interface CommitEntry {
  hash: string
  branch: string
  message: string
  author: {
    name: string
    email?: string
  }
  changeset: VCSFileEntry[]
}

/**
 * The object ID of the canonical empty tree in Git.
 * Used as a synthetic parent when diffing or creating the first commit.
 * Value is stable across all repositories.
 */
export const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'

export interface GitAdapter {
  commit(repoRoot: string, params?: GitCommitOptions): Promise<string>
  changedFiles(repoRoot: string, fromOid: GitOid, toOid: string): Promise<VCSFileEntry[]>
  currentBranch(repoRoot: string): Promise<string>
  log(repoRoot: string, opts: LogOptions): Promise<CommitEntry[]>
  head(repoRoot: string): Promise<string | null>
  readCommit(
    repoRoot: string,
    oid: GitOid,
    opts?: ReadCommitOptions
  ): Promise<CommitEntry>
  repositoryRoot(dir: string): Promise<string | null>
  repositoryUser(dir: string): Promise<GitUser | null>
  status(repoRoot: string, filter?: StatusFilter): Promise<ChangesetMatrix>
  repositoryStatus(dir: string): Promise<[RepositoryStatus, ChangesetMatrix]>
  stage(repoRoot: string, files?: any): Promise<void>
}

/**
 * Parse the stdout output of `git merge` and retrieve file list
 *
 * @param stdout - The stdout output from a `git merge` command
 * @returns An array of file paths that were created during the merge
 */
export const parseGitMergeOutput = (stdout: string) => {
  const lines = stdout.split('\n')

  return lines.reduce((files: string[], line) => {
    const match = line.match(/^\s*create mode\s+\d+\s+(.+)$/)
    if (match) {
      files.push(match[1])
    }
    return files
  }, [])
}
