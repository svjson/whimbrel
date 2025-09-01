import path from 'node:path'
import { mergeLeft, PropertyPath } from '@whimbrel/walk'
import { KeyOrder } from './key-order'

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
  content: ModelFormat | SerializedFormat
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
 */
export const ifFileExistsAt = async <T>(
  disk: StorageAdapter,
  filePath: string | string[],
  fileName: string,
  fn: (fPath: string) => Promise<T>
) => {
  let actualPath = Array.isArray(filePath) ? path.join(...filePath) : filePath
  if (path.basename(actualPath) !== fileName) {
    actualPath = path.join(actualPath, fileName)
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
 */
export const makeReadIfExists =
  <T extends StructuredFile<MF, SF>, MF, SF>(
    impl: StructuredFileCtor<T, MF, SF>,
    fileName: string,
    reader: (storage: StorageAdapter, fPath: string) => Promise<SF | MF>
  ) =>
  async (storage: StorageAdapter, filePath: string | string[]) => {
    return await ifFileExistsAt(storage, filePath, fileName, async (fPath) => {
      return new impl({
        path: fPath,
        storage,
        content: await reader(storage, fPath),
      })
    })
  }

/**
 * Creates a static utility function for a specific file format and
 * default file name that reads the file from storage and creates an
 * adapter instance, or throws an Error if the file can not be found.
 */
export const makeRead =
  <T extends StructuredFile<MF, SF>, MF, SF>(
    impl: StructuredFileCtor<T, MF, SF>,
    fileName: string,
    reader: (storage: StorageAdapter, fPath: string) => Promise<SF | MF>
  ) =>
  async (storage: StorageAdapter, filePath: string | string[]) => {
    const structFile = await makeReadIfExists(impl, fileName, reader)(storage, filePath)
    if (structFile) return structFile

    throw new Error(
      `${fileName} file not found: ${Array.isArray(filePath) ? path.join(...filePath) : filePath}`
    )
  }

export interface StructOptions {
  stripUnknown?: boolean
}

export abstract class StructuredFile<ModelFormat = any, SerializedFormat = string> {
  protected path: string
  protected storage: StorageAdapter
  protected keyOrder: KeyOrder
  protected content: ModelFormat

  constructor({
    path,
    storage,
    keyOrder,
    content,
  }: StructuredFileCtorParams<ModelFormat, SerializedFormat>) {
    this.path = path
    this.storage = storage
    this.keyOrder = keyOrder
    this.content = this.deserializeContent(content)
  }

  abstract deserializeContent(content: ModelFormat | SerializedFormat): ModelFormat

  abstract containsAll(property: PropertyPath, values: any[]): boolean

  getPath(): string {
    return this.path
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

  abstract write(): Promise<void>
}
