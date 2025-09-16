import { parse as parseJSON } from 'jsonc-parser'

import { toFileSystemWriteOptions } from '@whimbrel/core-api'

import {
  FileEntry,
  FileSystem,
  FileSystemCtxOptions,
  FileSystemReadOptions,
  FileSystemRecurseOptions,
  FileSystemScanOptions,
  FileSystemWriteOptions,
} from '@whimbrel/core-api'

/**
 * Abstract implementation of FileSystem, providing common functionality.
 */
export abstract class AbstractFileSystem implements FileSystem {
  abstract copy(fromPath: string, toPath: string): Promise<void>

  abstract delete(filePath: string, opts?: FileSystemCtxOptions): Promise<void>

  abstract exists(filePath: string): Promise<boolean>

  abstract isDirectory(dirPath: string): Promise<boolean>

  abstract isPhysical(): boolean

  abstract ls(dirPath: string): Promise<string[]>

  abstract mkdir(
    dirPath: string,
    opts: FileSystemCtxOptions & FileSystemRecurseOptions
  ): Promise<string | void>

  abstract mktmpdir(pattern: string): Promise<string>

  abstract move(
    fromPath: string,
    toPath: string,
    opts?: FileSystemCtxOptions
  ): Promise<void>

  abstract read(filePath: string, opts: FileSystemReadOptions): Promise<string | Buffer>

  async readJson<T>(filePath: string, encoding = 'utf-8') {
    return parseJSON((await this.read(filePath, encoding)) as string) as T
  }

  abstract scanDir(filePath: string, opts: FileSystemScanOptions): Promise<FileEntry[]>

  abstract write(
    filePath: string,
    content: string | Buffer,
    opts?: FileSystemWriteOptions
  ): Promise<void>

  abstract writeReference(
    filePath: string,
    absolutePath: string,
    opts?: {}
  ): Promise<void>

  async writeJson(filePath: string, content: any, opts: FileSystemWriteOptions = {}) {
    opts = toFileSystemWriteOptions(opts)
    await this.write(filePath, `${JSON.stringify(content, null, 2)}\n`, opts)
  }
}
