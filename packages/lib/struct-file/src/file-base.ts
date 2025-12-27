import { StorageAdapter } from './storage'

/**
 * Abstract base for files with structured content
 *
 * @param ModelFormat - The in-memory representation of the file's content
 * @param SerializedFormat - The on-disk representation of the file's content
 */
export abstract class FileBase<ModelFormat = any, SerializedFormat = string> {
  /**
   * The path to the file on disk
   */
  protected path: string
  /**
   * The storage adapter used to read/write the file
   */
  protected storage: StorageAdapter
  /**
   * The in-memory representation of the file's content
   */
  protected content: ModelFormat

  /**
   * Creates a new FileBase instance
   *
   * @param path The path to the file on disk
   * @param storage The storage adapter used to read/write the file
   * @param content The on-disk representation of the file's content
   */
  constructor({ path, storage, content }) {
    this.path = path
    this.storage = storage
    this.content = this.deserializeContent(content)
  }

  /**
   * Deserialize the file content from its on-disk representation
   *
   * @param content The on-disk representation of the file's content
   *
   * @returns The in-memory representation of the file's content
   */
  abstract deserializeContent(content: ModelFormat | SerializedFormat): ModelFormat

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
