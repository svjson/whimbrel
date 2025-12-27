import path from 'node:path'
import { mergeLeft, PropertyPath } from '@whimbrel/walk'
import { KeyOrder } from './key-order'
import { SchemaProperty, StructuredFileSchema, schemaPropertyAtPath } from './schema'
import { StorageAdapter } from './storage'
import { FileBase } from './file-base'

/**
 * Constructor parameter object for StructuredFile and any subclass expecting
 * to make use of `makeReadIfExists` or `makeRead`
 */
export interface StructuredFileCtorParams<ModelFormat, SerializedFormat> {
  /**
   * The full path to the file on `storage`
   */
  path?: string
  /**
   * Storage/file system adapter, used to write the file contents back to disk.
   */
  storage?: StorageAdapter
  /**
   * Optionally defines a schema for the structured file, describing valid values
   * and types.
   *
   * If a schema is provided and `keyOrder` is omitted, the keyOrder may be
   * derived from the schema, unless instructed otherwise.
   */
  schema?: StructuredFileSchema
  /**
   * The, optional, internal structure of the file. Any changes or additions to
   * a structured file will be ordered and formatted according to this ruleset,
   * if provided.
   */
  keyOrder?: KeyOrder
  /**
   * The content at construction time. Providing separate ModelFormat and
   * SerializedFormat types allows the concrete StructuredFile type to be
   * instantiated with either the serialized file format and the internal
   * programmatic model.
   */
  content?: ModelFormat | SerializedFormat
}

/**
 * Type describing any constructor of a StructuredFileCtor that maintains
 * the constructor format of the base type.
 */
export type StructuredFileCtor<T extends StructuredFile<MF, SF>, MF, SF> = new (
  params: StructuredFileCtorParams<MF, SF>
) => T

/**
 * Ensure that a PropertyPath is of the concrete type string[]
 *
 * @param propertyPath The property path to convert
 * @returns The property path as an array of strings
 *
 * @throws If the property path is not a string or string[]
 */
export const asArrayPath = (propertyPath: PropertyPath) => {
  if (typeof propertyPath === 'string') {
    return propertyPath.split('.')
  } else if (Array.isArray(propertyPath)) {
    return propertyPath
  }
  throw new Error('Unknown path structure')
}

/**
 * Utility function providing the feature of refering to a known
 * file type/structure with a known name by path only, e.g, package.json
 * or pnpm-workspaces.yaml
 *
 * If the file exists at the provided path (optionally appending
 * `fileName` if the path is a directory), the provided function
 * `fn` is called with the actual file path, and its result
 *
 * @param disk The storage adapter to use/read from
 * @param filePath The path to the file, or directory containing the file
 * @param fileName The name of the file to look for inside `filePath` if
 *                 `filePath` is a directory
 * @param fn The function to call if the file exists, receiving the
 *
 * @returns The result of `fn` if the file exists, or `undefined` otherwise
 */
export const ifFileExistsAt = async <T>(
  disk: StorageAdapter,
  filePath: string | string[],
  fileName: string | null,
  fn: (fPath: string) => Promise<T>
) => {
  let actualPath = Array.isArray(filePath) ? path.join(...filePath) : filePath
  if (await disk.isDirectory(actualPath)) {
    if (path.basename(actualPath) !== fileName) {
      actualPath = path.join(actualPath, fileName)
    }
  }

  if (await disk.exists(actualPath)) {
    return fn(actualPath)
  }

  return undefined
}

/**
 * Creates a static utility function for a specific file format and
 * default file name that reads the file from storage and creates an
 * adapter instance, or returns `undefined` if the file can not be
 * found.
 *
 * @param impl The StructuredFile subclass constructor
 * @param defaultFileName The default file name(s) to look for inside
 *                        the provided path. If `null`, the base name
 *                        of the provided path is used and therefore
 *                        must be provided by callers.
 *
 * @returns The StructuredFile instance if the file exists, or `undefined`
 */
export const makeReadIfExists = <T extends StructuredFile<MF, SF>, MF, SF>(
  impl: StructuredFileCtor<T, MF, SF>,
  defaultFileName: string | string[] | null,
  reader: (storage: StorageAdapter, fPath: string) => Promise<SF | MF>
) => {
  if (typeof defaultFileName === 'string') defaultFileName = [defaultFileName]
  return async (storage: StorageAdapter, filePath: string | string[]) => {
    let dirPath = filePath
    filePath = Array.isArray(filePath) ? path.join(...filePath) : filePath
    let fileNames = defaultFileName
    if (defaultFileName === null) {
      fileNames = [path.basename(filePath)]
      dirPath = path.dirname(filePath)
    }
    for (const fn of fileNames) {
      const file = await ifFileExistsAt(storage, dirPath, fn, async (fPath) => {
        return new impl({
          path: fPath,
          storage,
          content: await reader(storage, fPath),
        })
      })
      if (file) return file
    }
  }
}

/**
 * Creates a static utility function for a specific file format and
 * default file name that reads the file from storage and creates an
 * adapter instance, or throws an Error if the file can not be found.
 *
 * @param impl The StructuredFile subclass constructor
 * @param fileName The default file name(s) to look for inside
 *                 the provided path. If `null`, the base name
 *                 of the provided path is used and therefore
 *                 must be provided by callers.
 * @param reader Function that reads the file content from storage
 *               and returns it in either ModelFormat or SerializedFormat
 * @throws If the file can not be found
 */
export const makeRead = <T extends StructuredFile<MF, SF>, MF, SF>(
  impl: StructuredFileCtor<T, MF, SF>,
  fileName: string | string[] | null,
  reader: (storage: StorageAdapter, fPath: string) => Promise<SF | MF>
) => {
  const readifE = makeReadIfExists(impl, fileName, reader)
  return async (storage: StorageAdapter, filePath: string | string[]) => {
    const structFile = await readifE(storage, filePath)
    if (structFile) return structFile

    throw new Error(
      `${fileName} - file not found: ${Array.isArray(filePath) ? path.join(...filePath) : filePath}`
    )
  }
}

export interface StructOptions {
  stripUnknown?: boolean
}

/**
 * Abstract base for file adapters with structured content.
 *
 * Structured content in this case refers to any file format that can be
 * represented as a hierarchy of properties and values, such as JSON or YAML, where
 * properties can be uniquely identified by their key or path.
 *
 * @param ModelFormat - The in-memory representation of the file's content
 */
export abstract class StructuredFile<
  ModelFormat = any,
  SerializedFormat = string,
> extends FileBase<ModelFormat, SerializedFormat> {
  protected schema: StructuredFileSchema
  protected keyOrder: KeyOrder

  constructor({
    path,
    storage,
    schema,
    keyOrder,
    content,
  }: StructuredFileCtorParams<ModelFormat, SerializedFormat>) {
    super({ path, storage, content })
    this.schema = schema
    this.keyOrder = keyOrder
  }

  abstract containsAll(property: PropertyPath, values: any[]): boolean

  /**
   * @return The base name of the file (the file name with extension, without path)
   */
  getFileName(): string {
    return path.basename(this.path)
  }

  /**
   * @return The full path to the file, including filename
   */
  getPath(): string {
    return this.path
  }

  /**
   * @return The schema associated with the structured file, if any
   */
  getSchema(): StructuredFileSchema | undefined {
    return this.schema
  }

  /**
   * Get the schema property at the specified property path, if any
   */
  getSchemaProperty(property: PropertyPath): SchemaProperty | undefined {
    if (this.schema) {
      return schemaPropertyAtPath(this.schema, property)
    }
  }

  /**
   * @return the internal representation of the file content
   */
  getContent(): ModelFormat {
    return this.content
  }

  abstract get<T = any>(property: PropertyPath, defaultValue?: T): T

  abstract set(property: PropertyPath, value: any): void

  assign(...values: any[]) {
    mergeLeft(this.content, ...values)
    this.enforceStructure()
  }

  abstract delete(property: PropertyPath): void

  abstract enforceStructure(opts?: StructOptions): void

  cleanAndReorder() {
    this.enforceStructure({ stripUnknown: true })
  }
}
