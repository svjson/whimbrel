import { parse as parseJSON } from 'jsonc-parser'

import { LsOptions, toFileSystemWriteOptions } from '@whimbrel/core-api'

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

  abstract isFile(filePath: string): Promise<boolean>

  abstract isPhysical(): boolean

  abstract ls(dirPath: string): Promise<string[]>
  abstract ls(dirPath: string, opts: { withFileTypes: true }): Promise<FileEntry[]>
  abstract ls(dirPath: string, opts: LsOptions): Promise<string[] | FileEntry[]>

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

  abstract rmdir(dirPath: string, opts?: FileSystemCtxOptions): Promise<void>

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

  abstract size(filePath: string): Promise<number>

  abstract timestamp(filePath: string): Promise<Date>

  async writeJson(filePath: string, content: any, opts: FileSystemWriteOptions = {}) {
    opts = toFileSystemWriteOptions(opts)
    await this.write(filePath, `${JSON.stringify(content, null, 2)}\n`, opts)
  }
}
