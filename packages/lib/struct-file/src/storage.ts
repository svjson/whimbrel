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
