import path from 'node:path'
import { pushUnique } from '@whimbrel/array'
import {
  ImportSourceDescription,
  SourceTreeReference,
  WhimbrelContext,
} from '@whimbrel/core-api'

export const resolveTargetPaths = async (
  _ctx: WhimbrelContext,
  sourceRef: SourceTreeReference
): Promise<string[]> => {
  switch (sourceRef.type) {
    case 'source-file':
      return [sourceRef.path]
    case 'paths':
      return sourceRef.paths
    case 'project-source-folders':
      throw new Error('"project-source-folders" not implemented')
  }
}

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

    const resolveSource = (base: string, p: string) => path.resolve(base, p)
    const withOptionalExt = (p: string) => (p.endsWith('.ts') ? [p, p.slice(0, -3)] : [p])

    const absoluteNodeSource = resolveSource(importLocation, nodeSource)
    const predicateSources = withOptionalExt(resolveSource(importLocation, source.name))

    return predicateSources.includes(absoluteNodeSource)
  }

  return false
}
