import path from 'node:path'
import ignore from 'ignore'
import { FileEntry, FileSystem } from '@whimbrel/core-api'

/**
 * Check if a file entry matches a given .gitignore pattern
 *
 * @param fileEntry - The file entry to check
 * @param pattern - The .gitignore pattern to match against
 *
 * @return True if the file entry matches the pattern, false otherwise
 */
export const match = (fileEntry: FileEntry, pattern: string) => {
  const ig = ignore()
  ig.add([pattern])

  const normalizedPath =
    fileEntry.type === 'directory'
      ? `${fileEntry.path.replace(/\/$/, '')}/`
      : fileEntry.path

  const match = ig.ignores(normalizedPath)
  return match
}

/**
 * Check if a file entry matches a given .gitignore pattern relative to the repository root
 *
 * @param repoRoot - The root directory of the repository
 * @param fileEntry - The file entry to check
 * @param pattern - The .gitignore pattern to match against
 *
 * @return True if the file entry matches the pattern, false otherwise
 */
export const matchRelative = (
  repoRoot: string,
  fileEntry: FileEntry,
  pattern: string
) => {
  return match(
    {
      path: path.relative(repoRoot, fileEntry.path),
      type: fileEntry.type,
    },
    pattern
  )
}

/**
 * Read and parse .gitignore entries from a repository root
 *
 * @param disk - The file system to read from
 * @param repoRoot - The root directory of the repository
 * @return An array of .gitignore entries
 *
 * @throws If the .gitignore file cannot be read
 */
export const readEntries = async (disk: FileSystem, repoRoot: string) => {
  const dotGitIgnoreFile = path.join(repoRoot, '.gitignore')

  const lines = ((await disk.read(dotGitIgnoreFile, 'utf-8')) as string).split('\n')

  const entries = []
  for (const l of lines) {
    const line = l.trim()
    if (line && !line.startsWith('#')) {
      entries.push(line)
    }
  }

  return entries
}
