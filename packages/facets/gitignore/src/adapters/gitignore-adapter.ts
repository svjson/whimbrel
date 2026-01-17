import path from 'node:path'
import ignore from 'ignore'
import micromatch from 'micromatch'
import { FileEntry, FileSystem, VCSIgnoreFile } from '@whimbrel/core-api'

/**
 * Regex for detecting glob meta-characters in a pattern
 */
const GLOB_META = /[*?[\]{]/

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
      name: fileEntry.name,
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

/**
 * Normalize a gitignore-ish pattern by removing leading ./ and trailing /
 *
 * @param p - The gitignore-ish pattern to normalize
 *
 * @return The normalized pattern
 */
const normalizePattern = (p: string): string => {
  return p.replace(/^\.\//, '').replace(/\/+$/, '')
}

/**
 * Expand a gitignore-ish pattern into one or more micromatch patterns
 * that represent what it covers/matches.
 *
 * Expands clear directory patterns to its base + glob syntax.
 * Keeps explicit globs as is, unless the glob pattern ends with /
 * Treats plain literal paths as potential directories.
 *
 * @param pattern - The gitignore-ish pattern to expand
 *
 * @return An array of micromatch patterns representing the coverage of the
 *         input pattern
 */
const expandForCoverage = (pattern: string): string[] => {
  const normP = normalizePattern(pattern)

  const isDir = normP.endsWith('/')

  const p = isDir ? normP.replace(/\/+$/, '') : normP

  if (isDir) {
    return [p, `${p}/**`]
  }

  if (GLOB_META.test(p)) {
    return [p]
  }

  return [p, `${p}/**`]
}

/**
 * Check if a sample path is covered by any of the given covering patterns.
 *
 * @param samplePath - The sample path to check
 * @param coveringPatterns - An array of arrays of covering micromatch patterns
 *
 * @return True if the sample path is covered by any of the covering patterns,
 *         false otherwise
 */
const isCoveredByAny = (samplePath: string, coveringPatterns: string[][]): boolean => {
  return coveringPatterns.some((expanded) =>
    expanded.some((pat) => micromatch.isMatch(samplePath, pat, { dot: true }))
  )
}

/**
 * Filter out any redundant ignore patterns from `entries`.
 *
 * Entries are considered to be redundant when they are fully covered
 * by another pattern.
 *
 * This selection is conservative in the sense that it keeps rather
 * than purges when coverage is unclear to the algorithm.
 *
 * @param entries - The array of VCS ignore file entries to purge
 *
 * @return The purged array of VCS ignore file entries
 */
export const purgeRedundant = (entries: VCSIgnoreFile[]): VCSIgnoreFile[] => {
  const items = entries.map((entry, index) => ({
    entry,
    index,
    normalized: normalizePattern(entry.pattern),
    expanded: expandForCoverage(entry.pattern),
  }))

  // Remove exact duplicates as a first step
  const seen = new Set<string>()
  const unique = items.filter((i) => {
    if (seen.has(i.normalized)) return false
    seen.add(i.normalized)
    return true
  })

  // Sort entries for decision-making
  const decisionOrder = [...unique].sort((a, b) => {
    const segsA = a.normalized.replace(/\/+$/, '').split('/').length
    const segsB = b.normalized.replace(/\/+$/, '').split('/').length
    if (segsA !== segsB) return segsA - segsB
    return a.normalized.length - b.normalized.length
  })

  // Keep a set of kept indices of the original entry set, so we can return
  // the result with unchanged order
  const kept = new Set<number>()
  const keptExpanded: string[][] = []

  // Test each candidate pattern against all other patterns, and flag to
  // to keep if it is not covered by another pattern.
  for (const candidate of decisionOrder) {
    const base = candidate.normalized.replace(/\/+$/, '')
    const samples = [base, `${base}/x`]

    const redundant = samples.every((s) => isCoveredByAny(s, keptExpanded))

    if (!redundant) {
      kept.add(candidate.index)
      keptExpanded.push(candidate.expanded)
    }
  }

  return entries.filter((_, idx) => kept.has(idx))
}
