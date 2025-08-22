import { MutationType } from './mutation'

/**
 * Enum-type for FileSystem objects. Files and directories...
 */
export type FsObjectType = 'file' | 'directory'

/**
 * Structure of reported mutations on a FileSystem.
 */
export interface FileSystemMutation {
  mutationType: 'fs'
  type: MutationType
  object: FsObjectType
  path: string
}

/**
 * Meta-directives for reporting of file system activity.
 *
 * This is used to control whether the file system operations
 * report their activity to the context and/or ApplicationLog.
 *
 * This is used for fine-grained control to disable reporting
 * when operations are performed that are not part of the
 * canonical tracking of execution side effects.
 *
 * @interface FileSystemCtxOptions
 * @property {boolean} [report] - If true, report the activity to the context.
 * @property {boolean} [silent] - If true, suppresses output to the ApplicationLog.
 */
export interface FileSystemCtxOptions {
  report?: boolean
  silent?: boolean
}

/**
 * Recursion option for FileSystem operations that allows recursive
 * execution.
 *
 * @interface FileSystemRecurseOptions
 * @property {boolean} [recursive] - If true, perform the operation recursively.
 */
export interface FileSystemRecurseOptions {
  recursive?: boolean
}

/**
 * Encoding options for file I/O.
 *
 * This is used to specify the encoding of file content
 * when reading or writing files.
 */
export interface FileSystemEncodingOptions {
  encoding?: string
}

/**
 * Options for FileSystem operations interacting with file content.
 *
 * This combines the context options and encoding options
 * to provide a unified interface for file operations.
 *
 * @interface FileSystemFileOptions
 * @property {FileSystemCtxOptions} [ctx] - Context options for the operation.
 * @property {FileSystemEncodingOptions} [encoding] - Encoding options for file content.
 */
export type FileSystemFileOptions = FileSystemCtxOptions & FileSystemEncodingOptions

/**
 * Options for Read operations.
 * This can be either a FileSystemFileOptions object or a file encoding, mimicing
 * the interface of `node:fs`
 *
 * @interface FileSystemReadOptions
 * @property {FileSystemFileOptions} [ctx] - Context options for the read operation.
 * @property {FileSystemEncodingOptions} [encoding] - Encoding options for the read operation.
 * @property {string} [encoding] - A string representing the encoding, if not using the FileSystemFileOptions.
 */
export type FileSystemReadOptions = FileSystemFileOptions | string

/**
 * Options for Write operations.
 * This can be either a FileSystemFileOptions object or a file encoding, mimicing
 * the interface of `node:fs`
 *
 * @interface FileSystemWriteOptions
 * @property {FileSystemFileOptions} [ctx] - Context options for the write operation.
 * @property {FileSystemEncodingOptions} [encoding] - Encoding options for the write operation.
 * @property {string} [encoding] - A string representing the encoding, if not using the FileSystemFileOptions.
 */
export type FileSystemWriteOptions = FileSystemFileOptions | string

/**
 * Options for scan operations.
 *
 * This allows for filtering, excluding certain types of objects, ignoring certain
 * entries based on a predicate, and controlling the depth of the scan.
 *
 * @interface FileSystemScanOptions
 * @property {FsObjectType[]} [exclude] - Types of objects to exclude from the scan.
 * @property {Function} [ignorePredicate] - A function to determine if an entry should be ignored.
 * @property {number} [depth] - The maximum depth to scan, where 0 is the current directory.
 * @property {Function} [filter] - A function to filter entries, returning true to include the entry.
 * @property {boolean} [sort] - If true, sort the entries by path.
 */
export type FileSystemScanOptions = {
  exclude?: FsObjectType[]
  ignorePredicate?: (entry: FileEntry) => boolean
  depth?: number
  filter?: (entry: FileEntry) => boolean
  sort?: boolean
}

/**
 * Options for creating directories.
 *
 * This combines the recursion options and context options to provide a unified
 * interface
 *
 * @interface FileSystemMkDirOptions
 * @property {FileSystemRecurseOptions} [recursive] - If true, create directories recursively.
 * @property {FileSystemCtxOptions} [ctx] - Context options for the mkdir operation.
 */
export type FileSystemMkDirOptions = FileSystemRecurseOptions & FileSystemCtxOptions

/**
 * Represents a file entry in the file system.
 */
export interface FileEntry {
  type: FsObjectType
  path: string
}

/**
 * Represents a structured file. Implementation not included, just like the batteries.
 */
export interface StructuredFile {}

/**
 * Interface for a FileSystem abstraction.
 *
 * This interface defines the methods for file system operations,
 * including reading, writing, copying, moving, deleting files,
 * creating directories, and scanning directories.
 *
 * This is used by all FileSystem operations in Whimbrel, to allow
 * a unified interface between the physical filesystem and in-memory
 * filesystems during dry-runs.
 */
export interface FileSystem {
  /**
   * Copy a file from one path to another.
   *
   * @param fromPath - The source file path.
   * @param toPath - The destination file path.
   */
  copy(fromPath: string, toPath: string): Promise<void>

  /**
   * Delete a file at the specified path.
   *
   * @param filePath - The path of the file to delete.
   * @param opts - Optional context options for the operation.
   *
   * @return A promise that resolves when the file is deleted.
   */
  delete(filePath: string, opts?: FileSystemCtxOptions): Promise<void>

  /**
   * Check if a file or directory exists at the specified path.
   *
   * @param filePath - The path to check for existence.
   *
   * @return A promise that resolves to true if the file or directory exists, false otherwise.
   */
  exists(filePath: string): Promise<boolean>

  /**
   * Check if the specified path is a directory.
   *
   * @param dirPath - The path to check.
   *
   * @return A promise that resolves to true if the path is a directory, false otherwise.
   */
  isDirectory(dirPath: string): Promise<boolean>

  /**
   * Query if the underlying FileSystem is a physical disk.
   *
   * This is used to determine if the FileSystem is a real disk or an in-memory
   * filesystem, such as during dry-runs.
   *
   * @return true if the FileSystem is a physical disk, false otherwise.
   */
  isPhysical(): boolean

  /**
   * Create a directory at the specified path.
   *
   * @param dirPath - The path of the directory to create.
   * @param opts - Options for the operation, including context and recursion options.
   *
   * @return A promise that resolves to the path of the created directory, or void if no path is returned.
   */
  mkdir(
    dirPath: string,
    opts: FileSystemCtxOptions & FileSystemRecurseOptions
  ): Promise<string | void>

  /**
   * Create a temporary directory with a specified pattern.
   *
   * The `pattern` refers to the leading part of an mktemp-style naming scheme.
   * Ie, providing 'mystuff' as `pattern` will result in a directory name such as
   * 'mystuff-12345678' where '12345678' is a random suffix.
   *
   * The exact format of the random sequence depends on the FileSystem implementation.
   *
   * @param pattern - The pattern for the temporary directory name.
   *
   * @return A promise that resolves to the path of the created temporary directory.
   */
  mktmpdir(pattern: string): Promise<string>

  /**
   * Move a file or directory from one path to another.
   *
   * If reporting is enabled, this will result in two file system mutations -
   * one of type 'create' and one of type 'delete'.
   *
   * @param fromPath - The source file or directory path.
   * @param toPath - The destination file or directory path.
   * @param opts - Optional context options for the operation.
   *
   * @return A promise that resolves when the move operation is complete.
   */
  move(fromPath: string, toPath: string, opts?: FileSystemCtxOptions): Promise<void>

  /**
   * Read the content of a file at the specified path.
   *
   * @param filePath - The path of the file to read.
   * @param opts - Options for the read operation, including context and encoding options.
   * @return A promise that resolves to the content of the file as a string or Buffer.
   */
  read(filePath: string, opts: FileSystemReadOptions): Promise<string | Buffer>

  /**
   * Read the content of a JSON file and parse it into a JS/TS Object.
   *
   * @param filePath - The path of the JSON file to read.
   * @param opts - Options for the read operation, including context and encoding options.
   * @return A promise that resolves to the parsed JSON content as a JS/TS Object.
   */
  readJson<T = any>(filePath: string, opts?: FileSystemReadOptions): Promise<T>

  /**
   * Scan the contents of the directory at `dirPath`.
   *
   * This will return an array of `FileEntry` objects representing
   * the files and directories in the specified directory.
   *
   * @param dirPath - The path of the directory to scan.
   * @param opts - Options for the scan operation, including filtering, depth, and sorting.
   * @param opts.exclude - Types of objects to exclude from the scan.
   * @param opts.ignorePredicate - A function to determine if an entry should be ignored.
   * @param opts.depth - The maximum depth to scan, where 0 is the current directory.
   * @param opts.filter - A function to filter entries, returning true to include the entry.
   * @param opts.sort - If true, sort the entries by path.
   * @return A promise that resolves to an array of `FileEntry` objects.
   */
  scanDir(dirPath: string, opts: FileSystemScanOptions): Promise<FileEntry[]>

  /**
   * Write content to a file at the specified path.
   *
   * This can handle both string and Buffer content.
   * If the file does not exist, it will be created.
   * If the file exists, it will be overwritten.
   *
   * @param filePath - The path of the file to write to.
   * @param content - The content to write to the file, either as a string or Buffer.
   * @param opts - Options for the write operation, including context and encoding options.
   * @return A promise that resolves when the write operation is complete.
   */
  write(
    filePath: string,
    content: string | Buffer,
    opts?: FileSystemWriteOptions
  ): Promise<void>

  /**
   * Write a JS/TS Object or StructuredFile as JSON content.
   *
   * This will serialize the content to JSON and write it to the specified file.
   * If the file does not exist, it will be created.
   *
   * @param filePath - The path of the file to write to.
   * @param content - The content to write to the file, either as a JS/TS Object or StructuredFile.
   * @param opts - Options for the write operation, including context and encoding options.
   * @return A promise that resolves when the write operation is complete.
   */
  writeJson(
    filePath: string,
    content: any | StructuredFile,
    opts?: FileSystemWriteOptions
  ): Promise<void>

  /**
   * Write a logical reference to a file elsewhere on the file system, without
   * copying its contents. Ie, a symlink.
   *
   * This will create a reference at `filePath` that points to `absolutePath`.
   *
   * Pre-dominantly used to populate in-memory filesystems with physical disk content
   * without reading into memory.
   */
  writeReference(filePath: string, absolutePath: string, opts?: {}): Promise<void>
}

/**
 * Utility function to box options for FileSystem operations.
 *
 * This function takes either a string representing the encoding or an options object,
 * and returns a boxed object with the appropriate type.
 */
const boxOptions = <T>(opts: T | string): T => {
  if (typeof opts === 'string') {
    return { encoding: opts } as T
  }
  return opts as T
}

/**
 * Utility function to convert FileSystemReadOptions to a boxed object.
 *
 * Used to promote encoding strings to FileSystemEncodingOptions-compatible
 * structure.
 */
export const toFileSystemReadOptions = (
  opts: FileSystemReadOptions
): FileSystemReadOptions => boxOptions<FileSystemReadOptions>(opts)

/**
 * Utility function to convert FileSystemWriteOptions to a boxed object.
 *
 * Used to promote encoding strings to FileSystemEncodingOptions-compatible
 * structure.
 */
export const toFileSystemWriteOptions = (
  opts: string | FileSystemWriteOptions
): FileSystemWriteOptions => boxOptions<FileSystemWriteOptions>(opts)
