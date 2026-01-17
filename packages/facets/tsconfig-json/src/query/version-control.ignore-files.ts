import path from 'node:path'
import { FacetQueryFunction, WhimbrelContext } from '@whimbrel/core-api'
import { TsConfigJSON } from '@src/adapters'
import { ReferenceTreeNode } from '@src/adapters/tsconfig.json-adapter'
import { pushUnique } from '@whimbrel/array'

/**
 * Extract ignore file patterns from a tsconfig.json file.
 *
 * @param file - The TsConfigJSON file to extract ignore patterns from.
 * @param root - The root directory of the actor.
 *
 * @return An array of ignore file patterns.
 */
const extractIgnoreFiles = (file: TsConfigJSON, root: string) => {
  const files = []

  const outDir = file.get('compilerOptions.outDir')

  if (outDir) {
    files.push({ pattern: `${outDir}/`, groups: ['build'], source: 'tsconfig.json' })
  }

  const tsBuildInfoPath = file.get<string>('compilerOptions.tsBuildInfoFile')
  if (tsBuildInfoPath) {
    files.push({ pattern: tsBuildInfoPath, groups: ['build'], source: 'tsconfig.json' })
  } else if (!file.get('references')) {
    files.push({
      pattern: `${path.parse(path.basename(file.getPath())).name}.tsbuildinfo`,
      groups: ['build'],
      source: 'tsconfig.json',
    })
  }

  return files
}

/**
 * Recursively walk the tsconfig.json reference tree to extract ignore files.
 *
 * @param refTree - The reference tree node to walk.
 * @param root - The root directory of the actor.
 */
const walkReferenceTree = (refTree: ReferenceTreeNode, root: string) => {
  if ('recursive' in refTree) return []

  const files = extractIgnoreFiles(refTree.file!, root)

  for (const ref of refTree.references) {
    pushUnique(files, ...walkReferenceTree(ref, root))
  }

  if (refTree.extends) {
    pushUnique(files, ...walkReferenceTree(refTree.extends, root))
  }

  return files
}

/**
 * Query implementation of `version-control:ignore-files`.
 *
 * This implementation inspects the actor's tsconfig.json
 * to determine the output directory for compiled TypeScript files,
 *
 * @param ctx - The Whimbrel context.
 * @param query - The FacetQuery containing the actor to inspect.
 *
 * @return An array of ignore file patterns based on the tsconfig.json outDir,
           if defined.
 */
export const queryVersionControlIgnoreFiles: FacetQueryFunction<
  'version-control:ignore-files'
> = async (ctx: WhimbrelContext, { actor }) => {
  if (actor) {
    const tsConfigScope = actor.facets['tsconfig.json']
    const tsConfigPath =
      tsConfigScope?.config?.path ?? path.join(actor.root, 'tsconfig.json')

    const refTree = await TsConfigJSON.readReferenceTree(ctx.disk, tsConfigPath, true)

    const ignoreFiles = walkReferenceTree(refTree, actor.root)

    return ignoreFiles
  }
}
