import isoGit, { FsClient, ReadCommitResult, StatusRow } from 'isomorphic-git'
import {
  ChangesetMatrix,
  CommitEntry,
  EMPTY_TREE,
  GitCommitOptions,
  GitOid,
  GitUser,
  LogOptions,
  ReadCommitOptions,
  RepositoryStatus,
} from '../git-adapter'
import { VCSFileEntry } from '@whimbrel/core-api'

/**
 * Get the list of files that have changed between two commits.
 *
 * @param fs - The filesystem client to use.
 * @param repoRoot - The root directory of the repository.
 * @param fromOid - The SHA of the starting commit (older).
 * @param toOid - The SHA of the ending commit (newer).
 * @return A promise that resolves to an array of VCSFileEntry objects representing the changed files.
 */
export const changedFiles = async (
  fs: FsClient,
  repoRoot: string,
  fromOid: string,
  toOid: string
): Promise<VCSFileEntry[]> => {
  const changes: VCSFileEntry[] = []

  const fromTreeOid = fromOid
    ? (await isoGit.readCommit({ fs, dir: repoRoot, oid: fromOid })).commit.tree
    : EMPTY_TREE

  const toTreeOid = (await isoGit.readCommit({ fs, dir: repoRoot, oid: toOid })).commit
    .tree

  const isBlob = async (entry) => entry && (await entry.type()) === 'blob'

  await isoGit.walk({
    fs,
    dir: repoRoot,
    trees: [isoGit.TREE({ ref: fromTreeOid }), isoGit.TREE({ ref: toTreeOid })],
    map: async (filepath, [a, b]) => {
      if (filepath === '.') return

      if ((a && !(await isBlob(a))) || (b && !(await isBlob(b)))) return

      if (a && !b) {
        changes.push({ file: filepath, mode: 'delete' })
      } else if (!a && b) {
        changes.push({ file: filepath, mode: 'create' })
      } else if (a && b) {
        const aOid = await a.oid()
        const bOid = await b.oid()
        if (aOid !== bOid) {
          changes.push({ file: filepath, mode: 'modify' })
        }
      }
    },
  })

  return changes
}

/**
 * Commit staged changes to the repository.
 *
 * @param fs - The filesystem client to use.
 * @param repoRoot - The root directory of the repository.
 * @param opts - Optional parameters for the commit operation.
 *             - message: The commit message.
 *             - report: Whether to generate a report after the commit (default: false).
 *
 * @return The commit SHA of the new commit.
 */
export const commit = async (
  fs: FsClient,
  repoRoot: string,
  opts: GitCommitOptions = {}
) => {
  const { message } = opts

  const author = await repositoryUser(fs, repoRoot)

  return await isoGit.commit({
    fs,
    dir: repoRoot,
    author: author,
    message,
  })
}

/**
 * Get the name of the current branch in the repository.
 *
 * @param fs - The filesystem client to use.
 * @param repoRoot - The root directory of the repository.
 *
 * @return The name of the current branch.
 */
export const currentBranch = async (fs: FsClient, repoRoot: string): Promise<string> => {
  return (await isoGit.currentBranch({
    fs,
    dir: repoRoot,
    fullname: true,
  })) as string
}

/**
 *
 */
export const head = async (fs: FsClient, repoRoot: string): Promise<string> => {
  try {
    const oid = await isoGit.resolveRef({
      fs: fs,
      dir: repoRoot,
      ref: 'HEAD',
    })
    return oid
  } catch (err) {
    if (err.code === 'NotFoundError') {
      return null
    } else {
      throw err
    }
  }
}

/**
 * Get the commit log for a specified branch or range of commits.
 *
 * @param fs - The filesystem client to use.
 * @param repoRoot - The root directory of the repository.
 * @param opts - Options for retrieving the log.
 *             - branch: The branch to retrieve the log from (default: current branch).
 *             - since: The starting commit SHA (exclusive).
 *             - until: The ending commit SHA (inclusive, default: HEAD).
 *             - changeset: Whether to include the list of changed files for each commit (default: false).
 *
 * @return An array of CommitEntry objects representing the commit log.
 */
export const log = async (fs: FsClient, repoRoot: string, opts: LogOptions) => {
  const { branch, since, until, changeset } = opts
  const result = []
  let done = false

  let last = null

  while (!done) {
    const commits = await isoGit.log({
      fs,
      dir: repoRoot,
      ref: last ?? opts.until,
      depth: 10,
    })

    for (let i = 0; i < commits.length; i++) {
      const ci = commits[i]
      if (done) continue
      if (i === 0 && until && ci.oid === last?.oid) continue

      if (ci.oid === since) {
        done = true
        break
      } else {
        const commitEntry: CommitEntry = toCommitEntry(ci, [], branch)

        if (changeset) {
          commitEntry.changeset = await changedFiles(
            fs,
            repoRoot,
            ci.commit.parent[0],
            ci.oid
          )
        }

        result.push(commitEntry)

        last = ci
      }
    }

    if (commits.length < 10) done = true
  }

  return result.reverse()
}

const toCommitEntry = (
  commit: ReadCommitResult,
  files: VCSFileEntry[] = [],
  branchName?: string
): CommitEntry => {
  return {
    hash: commit.oid,
    message: commit.commit.message,
    author: {
      name: commit.commit.author.name,
      email: commit.commit.author.email,
    },
    branch: branchName,
    changeset: files,
  }
}

export const readCommit = async (
  fs: FsClient,
  repoRoot: string,
  oid: GitOid,
  opts: ReadCommitOptions = {}
): Promise<CommitEntry> => {
  const readResult = await isoGit.readCommit({
    fs: fs,
    dir: repoRoot,
    oid: oid,
  })

  let changeset: VCSFileEntry[]
  if (opts?.withChangeset) {
    changeset = await changedFiles(
      fs,
      repoRoot,
      readResult.commit.parent[0],
      readResult.oid
    )
  }

  return toCommitEntry(readResult, changeset)
}

/**
 * Given that directory `dir` is part of a git repository, locate the root of
 * the repository.
 *
 * @param ctx - The Whimbrel context.
 * @param dir - The directory to start searching from.
 */
export const repositoryRoot = async (fs: FsClient, dir: string) => {
  if (!dir) return null

  try {
    return await isoGit.findRoot({
      fs,
      filepath: dir,
    })
  } catch (e) {
    return null
  }
}

/**
 * Summarize the current state of a git repository.
 *
 * This is expensive in large git repositories, due to statusMatrix
 * being slow with isomorphic-git on large repositories.
 *
 * A decision needs to be made whether to keep using this at all, or
 * throw it out in favor of a workaround.
 */
export const repositoryStatus = async (
  fs: FsClient,
  repoPath: string
): Promise<[RepositoryStatus, StatusRow[]]> => {
  try {
    const state: RepositoryStatus = {
      root: repoPath,
      initialized: Boolean(await repositoryRoot(fs, repoPath)),
      branch: undefined,
      staged: [],
      untracked: [],
      unstaged: [],
      head: undefined,
    }
    const matrix: StatusRow[] = []
    if (state.initialized) {
      state.branch = await currentBranch(fs, repoPath)
      state.head = await head(fs, repoPath)
      matrix.push(...(await status(fs, repoPath)))
      matrix.forEach((file) => {
        const [filePath, head, workdir, stage] = file
        if (head === 0 && stage === 0 && workdir === 2) {
          state.untracked.push(filePath)
        } else if (head !== stage && stage === workdir) {
          state.staged.push(filePath)
        } else if (stage === head && workdir !== stage) {
          state.unstaged.push(filePath)
        }
      })
    }
    return [state, matrix]
  } catch (e) {
    console.error('Failed to read repo state', e)
    throw e
  }
}

/**
 * Retrieve the user configuration (name and email) for the repository.
 *
 * @param fs - The filesystem client to use.
 * @param repoPath - The path to the repository.
 *
 * @return An object containing the user's name and email.
 */
export const repositoryUser = async (
  fs: FsClient,
  repoPath: string
): Promise<GitUser> => {
  const name = await isoGit.getConfig({
    fs,
    dir: repoPath,
    path: 'user.name',
  })

  const email = await isoGit.getConfig({
    fs,
    dir: repoPath,
    path: 'user.email',
  })

  return { name, email }
}

/**
 * Stage files for commit in the repository at `repoRoot`.
 *
 * @param fs - The filesystem client to use.
 * @param repoRoot - The root directory of the repository.
 * @param filter - Optional array of files to stage. Each entry should be an array
 *
 * @return A promise that resolves when the staging operation is complete.
 */
export const stage = async (fs: FsClient, repoRoot: string, filter?: any[]) => {
  let files = []
  if (Array.isArray(filter)) {
    files = filter
  }

  for (const file of files) {
    const [filePath, _head, workdir, stage] = file

    try {
      if (workdir === 0 && stage === 1) {
        await isoGit.remove({
          fs,
          dir: repoRoot,
          filepath: filePath,
        })
      } else {
        await isoGit.add({
          fs,
          dir: repoRoot,
          filepath: filePath,
        })
      }
    } catch (e) {
      console.warn(`${file} - ${e}`)
    }
  }
}

/**
 * Get the status of files in the repository.
 *
 * @param fs - The filesystem client to use.
 * @param repoRoot - The root directory of the repository.
 * @param filters - Optional filter function to apply to the status rows.
 *
 * @return An array of StatusRow objects representing the status of files in the repository.
 */
export const status = async (
  fs: FsClient,
  repoRoot: string,
  filters?: (row: StatusRow) => boolean
): Promise<ChangesetMatrix> => {
  try {
    const status = await isoGit.statusMatrix({
      fs,
      dir: repoRoot,
    })
    if (typeof filters === 'function') {
      return status.filter(filters)
    } else if (filters) {
      throw new Error(`Handling filter type: '${filters}' not implemented.`)
    }
    return status
  } catch (e) {
    console.error(e)
    throw e
  }
}
