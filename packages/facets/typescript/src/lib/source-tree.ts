import path from 'node:path'
import { pushUnique } from '@whimbrel/array'
import { ImportSourceDescription, WhimbrelContext } from '@whimbrel/core-api'

/**
 * List all TypeScript source files in the given source folders.
 *
 * @param ctx - The Whimbrel context.
 * @param sourceFolders - Array of source folder paths to scan.
 */
export const listSourceFiles = async (
  ctx: WhimbrelContext,
  sourceFolders: string[]
): Promise<string[]> => {
  const files: string[] = []

  const scanResults = await Promise.all(
    sourceFolders.map((dir) =>
      ctx.disk.scanDir(dir, {
        ignorePredicate(entry) {
          return !entry.name.endsWith('.ts')
        },
      })
    )
  )

  for (const entries of scanResults) {
    pushUnique(files, ...entries.map((e) => e.path))
  }

  return files
}

/**
 * Query if a ImportSourceDescription matches the import source of an
 * import statement.
 *
 * Library type imports simply matches the library name with the
 * from-segment of an import statement.
 *
 * Relative type imports(tree) resolves the import path relative to the
 * importing file location and compares the resolved paths.
 *
 * @param source - The ImportSourceDescription to match against.
 * @param nodeSource - The source string from the import statement.
 * @param importLocation - The location of the importing file.
 *
 * @return True if the ImportSourceDescription matches the import source.
 */
export const matchesImportSource = (
  source: ImportSourceDescription,
  nodeSource: string,
  importLocation: string
) => {
  if (source.type === 'library') {
    return nodeSource === source.name
  }

  if (source.type === 'tree') {
    if (!importLocation || !source.name) return false
    return (
      path.resolve(importLocation, nodeSource) ===
      path.resolve(importLocation, source.name)
    )
  }

  return false
}
