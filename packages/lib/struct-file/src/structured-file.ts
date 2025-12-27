import path from 'node:path'
import { mergeLeft, PropertyPath } from '@whimbrel/walk'
import { KeyOrder } from './key-order'
import { SchemaProperty, StructuredFileSchema, schemaPropertyAtPath } from './schema'

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
 * Minimal interface for file storage, decoupling the interface from
 * @whimbrel/filesystem.
 *
 * The interface is a partial of Whimbrel's FileSystem, which means that
 * any implementation thereof will fulfill the FileSystem contract, and
 * creating an adapter for any other kind of storage or file system interface
 * can be done with small effort.
 */
export interface StorageAdapter {
  /**
   * Read a raw file from storage.
   *
   * Implementations are expected to behave according to the contract of
   * node:fs's readFile and/or * Whimbrel's FileSystem.read
   *
   * @param path The path to the file to read
   * @param opts Optional read options
   * @returns The file content as string or Buffer
   * @throws If the file does not exist or cannot be read
   */
  read(path: string, opts?: any): Promise<string | Buffer<ArrayBufferLike>>
  /**
   * Write a file to storage.
   *
   * Implementations are expected to behave according to the contract of
   * node:fs/promises's writeFile and/or
   * Whimbrel's FileSystem.write
   *
   * @param path The path to the file to write
   * @param content The content to write
   * @param opts Optional write options
   * @throws If the file cannot be written
   */
  write(path: string, content: any, opts?: any): Promise<void>
  /**
   * Write an object to disk as JSON.
   *
   * Implementatios are expected to behave according to the contract of
   * Whimbrel's FileSystem.writeJson
   *
   * @param path The path to the file to write
   * @param content The content to write
   * @param opts Optional write options
   * @throws If the file cannot be written
   */
  writeJson(path: string, content: any, opts?: any): Promise<void>
  /**
   * Check if a file/path exists.
   *
   * Implementations are expected to behave according to the contract of
   * node:fs/promises's exists and/or Whimbrel's FileSystem.exists
   *
   * @param path The path to check for existence
   * @param opts Optional exists options
   * @return True if the path exists, false otherwise
   */
  exists(path: string, opts?: any): Promise<boolean>
  /**
   * Check if a path names an existing directory.
   *
   * Implementations must return `true` only if the path exists and is
   * a directory or directory symlink, and otherwise `false` regardless of
   * if the path exists or not.
   *
   * @param dirPath The path to check
   * @return True if the path exists and is a directory, false otherwise
   */
  isDirectory(dirPath: string): Promise<boolean>
}

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
 * @param ModelFormat - The in-memory representation of the file's content
 */
export abstract class StructuredFile<ModelFormat = any, SerializedFormat = string> {
  protected path: string
  protected storage: StorageAdapter
  protected schema: StructuredFileSchema
  protected keyOrder: KeyOrder
  protected content: ModelFormat

  constructor({
    path,
    storage,
    schema,
    keyOrder,
    content,
  }: StructuredFileCtorParams<ModelFormat, SerializedFormat>) {
    this.path = path
    this.storage = storage
    this.schema = schema
    this.keyOrder = keyOrder
    this.content = this.deserializeContent(content)
  }

  abstract deserializeContent(content: ModelFormat | SerializedFormat): ModelFormat

  abstract containsAll(property: PropertyPath, values: any[]): boolean

  getPath(): string {
    return this.path
  }

  getSchema(): StructuredFileSchema | undefined {
    return this.schema
  }

  getSchemaProperty(property: PropertyPath): SchemaProperty | undefined {
    if (this.schema) {
      return schemaPropertyAtPath(this.schema, property)
    }
  }

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

  /**
   * Writes the file to disk
   *
   * Providing a path is optional - if omitted, it will be written back to
   * the path it was read from.
   *
   * @param path Optional path to write the file to
   * @throws If no path is provided and the file was not read from disk
   */
  abstract write(path?: string | string[]): Promise<void>
}
