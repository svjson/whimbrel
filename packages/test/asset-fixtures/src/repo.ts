import { promises as fs } from 'node:fs'
import { execFile } from 'node:child_process'
import path from 'node:path'
import { ASSETS_ROOT } from './root'

function run(command: string, args: string[], options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, options, (err, stdout, stderr) => {
      if (err) {
        err.stdout = stdout
        err.stderr = stderr
        return reject(err)
      }
      resolve({ stdout, stderr })
    })
  })
}

/**
 * Unpacks a git repository tarball into the given target directory.
 *
 * @param {string} repoName   Name of the repo tarball under ./assets/git-repositories
 * @param {string} targetDir  Absolute path to an existing (empty) directory
 */
export async function unpackGitRepository(repoName: string, targetDir: string) {
  const tarball = path.join(ASSETS_ROOT, 'git-repositories', `${repoName}.tar.gz`)

  // Ensure target directory exists and is empty
  await fs.access(targetDir).catch(() => {
    throw new Error(`Target directory does not exist: ${targetDir}`)
  })

  const files = await fs.readdir(targetDir)
  if (files.length > 0) {
    throw new Error(`Target directory is not empty: ${targetDir}`)
  }

  await run('tar', ['-xzf', tarball, '-C', targetDir])
}
