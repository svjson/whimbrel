import path from 'node:path'
import equal from 'fast-deep-equal'

import {
  JSONFile,
  KeyOrder,
  deriveKeyOrder,
  makeRead,
  makeReadIfExists,
  StorageAdapter,
  StructuredFileSchema,
} from '@whimbrel/struct-file'
import { walk } from '@whimbrel/walk'

export type ReferenceTree = {
  fileName: string
  references: ReferenceTreeNode[]
  extends?: ReferenceTreeNode
  file?: TsConfigJSON
}

export type RecursiveTreeNode = {
  fileName: string
  recursive: true
}

export type ReferenceTreeNode = ReferenceTree | RecursiveTreeNode

const TSCONFIG_SCHEMA: StructuredFileSchema = {
  properties: [
    {
      name: 'extends',
      type: 'string',
      inherit: false,
    },
    {
      name: 'compilerOptions',
      type: 'object',
      inherit: true,
      merge: 'shallow',
      schema: {
        properties: [
          {
            name: 'target',
            type: 'string',
            inherit: true,
          },
          {
            name: 'module',
            type: 'string',
            inherit: true,
          },
          {
            name: 'moduleResolution',
            type: 'string',
            inherit: true,
          },
          {
            name: 'moduleDetection',
            type: 'string',
            inherit: true,
          },
          {
            name: 'jsx',
            type: 'string',
            inherit: true,
          },
          {
            name: 'jsxImportSource',
            type: 'string',
            inherit: true,
          },
          {
            name: 'verbatimModuleSyntax',
            type: 'boolean',
            inherit: true,
          },
          {
            name: 'resolveJsonModule',
            type: 'boolean',
            inherit: true,
          },
          {
            name: 'allowArbitraryExtensions',
            type: 'boolean',
            inherit: true,
          },
          {
            name: 'outDir',
            type: 'string',
            inherit: 'custom',
          },
          {
            name: 'rootDir',
            type: 'string',
            inherit: 'custom',
          },
          {
            name: 'declaration',
            type: 'boolean',
            inherit: true,
          },
          {
            name: 'declarationMap',
            type: 'boolean',
            inherit: true,
          },
          {
            name: 'sourceMap',
            type: 'boolean',
            inherit: true,
          },
          {
            name: 'inlineSources',
            type: 'boolean',
            inherit: true,
          },
          {
            name: 'removeComments',
            type: 'boolean',
            inherit: true,
          },
          {
            name: 'newLine',
            type: 'string',
            inherit: true,
          },
          {
            name: 'importsNotUsedAsValues',
            type: 'string',
            inherit: true,
          },
          {
            name: 'noEmit',
            type: 'boolean',
            inherit: true,
          },
          {
            name: 'emitDeclarationOnly',
            type: 'boolean',
            inherit: true,
          },
          {
            name: 'emitDecoratorMetadata',
            type: 'boolean',
            inherit: true,
          },
          {
            name: 'stripInternal',
            type: 'boolean',
            inherit: true,
          },
          /* Emit / build layout */
          { name: 'outDir', type: 'string', inherit: 'custom' }, // relative path concerns
          { name: 'rootDir', type: 'string', inherit: 'custom' }, // relative path concerns
          { name: 'declaration', type: 'boolean', inherit: true },
          { name: 'declarationMap', type: 'boolean', inherit: true },
          { name: 'emitDeclarationOnly', type: 'boolean', inherit: true },
          { name: 'sourceMap', type: 'boolean', inherit: true },
          { name: 'inlineSources', type: 'boolean', inherit: true },
          { name: 'removeComments', type: 'boolean', inherit: true },
          { name: 'newLine', type: 'string', inherit: true },
          { name: 'importsNotUsedAsValues', type: 'string', inherit: true },
          { name: 'noEmit', type: 'boolean', inherit: true },
          { name: 'noEmitOnError', type: 'boolean', inherit: true },
          { name: 'stripInternal', type: 'boolean', inherit: true },

          /* Interop / resolution */
          { name: 'baseUrl', type: 'string', inherit: 'custom' }, // relative path + resolver behavior
          {
            name: 'paths',
            type: 'object',
            inherit: 'custom',
            merge: 'custom',
            schema: { allowArbitraryProperties: true, properties: [] },
          }, // map<string, string[]>
          { name: 'rootDirs', type: 'string[]', inherit: true },
          { name: 'typeRoots', type: 'string[]', inherit: true },
          { name: 'types', type: 'string[]', inherit: true },
          { name: 'lib', type: 'string[]', inherit: true },
          { name: 'preserveSymlinks', type: 'boolean', inherit: true },
          { name: 'esModuleInterop', type: 'boolean', inherit: true },
          { name: 'allowSyntheticDefaultImports', type: 'boolean', inherit: true },
          { name: 'resolvePackageJsonExports', type: 'boolean', inherit: true },
          { name: 'resolvePackageJsonImports', type: 'boolean', inherit: true },

          /* JS support */
          { name: 'allowJs', type: 'boolean', inherit: true },
          { name: 'checkJs', type: 'boolean', inherit: true },
          { name: 'maxNodeModuleJsDepth', type: 'number', inherit: true },

          /* Strictness */
          { name: 'strict', type: 'boolean', inherit: true },
          { name: 'noImplicitAny', type: 'boolean', inherit: true },
          { name: 'noImplicitThis', type: 'boolean', inherit: true },
          { name: 'strictNullChecks', type: 'boolean', inherit: true },
          { name: 'strictFunctionTypes', type: 'boolean', inherit: true },
          { name: 'strictBindCallApply', type: 'boolean', inherit: true },
          { name: 'alwaysStrict', type: 'boolean', inherit: true },
          { name: 'useUnknownInCatchVariables', type: 'boolean', inherit: true },
          { name: 'exactOptionalPropertyTypes', type: 'boolean', inherit: true },
          { name: 'noUncheckedIndexedAccess', type: 'boolean', inherit: true },
          { name: 'noPropertyAccessFromIndexSignature', type: 'boolean', inherit: true },
          { name: 'noImplicitOverride', type: 'boolean', inherit: true },
          { name: 'noImplicitReturns', type: 'boolean', inherit: true },
          { name: 'allowUnreachableCode', type: 'boolean', inherit: true },
          { name: 'allowUnusedLabels', type: 'boolean', inherit: true },

          /* Helpers / downleveling / decorators */
          { name: 'noEmitHelpers', type: 'boolean', inherit: true },
          { name: 'importHelpers', type: 'boolean', inherit: true },
          { name: 'downlevelIteration', type: 'boolean', inherit: true },
          { name: 'useDefineForClassFields', type: 'boolean', inherit: true },
          { name: 'experimentalDecorators', type: 'boolean', inherit: true },
          { name: 'emitDecoratorMetadata', type: 'boolean', inherit: true },

          /* Project references / incremental */
          { name: 'composite', type: 'boolean', inherit: true },
          { name: 'incremental', type: 'boolean', inherit: true },
          { name: 'tsBuildInfoFile', type: 'string', inherit: 'custom' }, // path
          {
            name: 'disableSourceOfProjectReferenceRedirect',
            type: 'boolean',
            inherit: true,
          },
          { name: 'disableSolutionSearching', type: 'boolean', inherit: true },

          /* Diagnostics / tooling (allowed in tsconfig even if mainly CLI) */
          { name: 'pretty', type: 'boolean', inherit: true },
          { name: 'listFiles', type: 'boolean', inherit: true },
          { name: 'listEmittedFiles', type: 'boolean', inherit: true },
          { name: 'traceResolution', type: 'boolean', inherit: true },
          { name: 'explainFiles', type: 'boolean', inherit: true },
          { name: 'extendedDiagnostics', type: 'boolean', inherit: true },
          { name: 'preserveWatchOutput', type: 'boolean', inherit: true },

          /* Plugin array (objects) — tool-specific; don’t try to merge */
          {
            name: 'plugins',
            type: 'object',
            inherit: 'custom',
            merge: 'custom',
            schema: { properties: [] },
          },
        ],
      },
    },
    /* File lists - TODO: Should these be inherited locally ? */
    { name: 'files', type: 'string[]', inherit: false },
    { name: 'include', type: 'string', inherit: false },
    { name: 'include', type: 'string[]', inherit: false },
    { name: 'exclude', type: 'string', inherit: false },
    { name: 'exclude', type: 'string[]', inherit: false },
    /*  Watch options */
    {
      name: 'watchOptions',
      type: 'object',
      inherit: true,
      merge: 'shallow',
      schema: {
        properties: [
          { name: 'watchFile', type: 'string', inherit: true }, // e.g., "useFsEvents", "fixedPollingInterval"
          { name: 'watchDirectory', type: 'string', inherit: true }, // e.g., "useFsEvents", "fixedPollingInterval"
          { name: 'fallbackPolling', type: 'string', inherit: true }, // e.g., "dynamicPriority", "fixedInterval"
          { name: 'synchronousWatchDirectory', type: 'boolean', inherit: true },
          { name: 'excludeDirectories', type: 'string[]', inherit: true },
          { name: 'excludeFiles', type: 'string[]', inherit: true },
        ],
      },
    },
    {
      name: 'typeAcquisition',
      type: 'object',
      inherit: true,
      merge: 'shallow',
      schema: {
        properties: [
          { name: 'enable', type: 'boolean', inherit: true },
          { name: 'include', type: 'string[]', inherit: true },
          { name: 'exclude', type: 'string[]', inherit: true },
          { name: 'disableFilenameBasedTypeAcquisition', type: 'boolean', inherit: true },
        ],
      },
    },
    { name: 'compileOnSave', type: 'boolean', inherit: true },
  ],
}

const TSCONFIG_KEY_ORDER: KeyOrder = deriveKeyOrder(TSCONFIG_SCHEMA)

export class TsConfigJSON extends JSONFile {
  constructor(...args: ConstructorParameters<typeof JSONFile>) {
    super({ ...args[0], schema: TSCONFIG_SCHEMA, keyOrder: TSCONFIG_KEY_ORDER })
  }
  hasRelativeParent(): boolean {
    const extendEntry: string = this.get('extends')
    return Boolean(extendEntry && extendEntry.match(/^\.{1,2}\//))
  }

  getExtendedConfigPath(): string | undefined {
    const extendEntry: string = this.get<string>('extends')
    if (!this.hasRelativeParent() || !this.path || !extendEntry) return undefined

    return path.relative(path.dirname(this.path), extendEntry)
  }

  getReferencedPaths(): string[] {
    const references = this.get('references')
    if (!Array.isArray(references)) return []

    return references.map((r) => r?.path).filter((p) => typeof p === 'string')
  }

  removeValuesInheritedFrom(parent: TsConfigJSON): void {
    walk(this.getContent(), {
      onEnd: ({ path, value }) => {
        if (equal(parent.get(path), value)) {
          this.delete(path)
        }
      },
    })
  }

  static readIfExists = makeReadIfExists(
    TsConfigJSON,
    'tsconfig.json',
    async (disk, fPath) => disk.read(fPath, 'utf8')
  )

  static read = makeRead(TsConfigJSON, 'tsconfig.json', async (disk, fPath) =>
    disk.read(fPath, 'utf8')
  )

  static async readHierarchy(
    disk: StorageAdapter,
    filePath: string | string[]
  ): Promise<TsConfigJSON[]> {
    const entryFile = await TsConfigJSON.readIfExists(disk, filePath)
    if (!entryFile) return undefined

    if (entryFile.hasRelativeParent()) {
      const parents = await TsConfigJSON.readHierarchy(
        disk,
        path.join(path.dirname(entryFile.getPath()), entryFile.get('extends'))
      )
      if (parents) {
        return [...parents, entryFile]
      }
    }
    return [entryFile]
  }

  /**
   * Read the reference tree of a tsconfig.json file.
   *
   * Returns a tree of ReferenceTreeNode, where each node refers to a
   * tsconfig(.*).json file that branches to other nodes  on "extends"
   * and "references".
   *
   * @param disk - The storage adapter to read files from.
   * @param filePath - The path to the tsconfig.json file.
   * @param includeFile - Whether to include the TsConfigJSON instance in the
   *                      tree nodes.
   * @param ignore - An array of file paths to ignore (to prevent cycles).
   *
   * @return The reference tree of the tsconfig.json file.
   */
  static async readReferenceTree(
    disk: StorageAdapter,
    filePath: string | string[],
    includeFile: boolean = false,
    seen: string[] = []
  ): Promise<ReferenceTree | undefined> {
    const entryFile = await TsConfigJSON.readIfExists(disk, filePath)
    if (!entryFile) return undefined

    const tree: ReferenceTree = {
      fileName: entryFile.path,
      references: [],
    }
    if (includeFile) tree.file = entryFile

    if (entryFile.hasRelativeParent()) {
      const parentPath = path.join(
        path.dirname(entryFile.getPath()),
        entryFile.get('extends')
      )
      if (seen.includes(parentPath)) {
        tree.extends = {
          fileName: parentPath,
          recursive: true,
        }
      } else {
        const parentTree = await TsConfigJSON.readReferenceTree(
          disk,
          parentPath,
          includeFile,
          [entryFile.path, ...seen]
        )
        tree.extends = parentTree
      }
    }

    for (const refEntry of entryFile.getReferencedPaths()) {
      const refPath = path.join(path.dirname(entryFile.getPath()), refEntry)
      if (seen.includes(refPath)) {
        tree.references.push({
          fileName: refPath,
          recursive: true,
        })
      } else {
        const refTree = await TsConfigJSON.readReferenceTree(disk, refPath, includeFile, [
          entryFile.path,
          ...seen,
        ])
        tree.references.push(refTree)
      }
    }
    return tree
  }
}
