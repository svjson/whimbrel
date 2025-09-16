import path from 'node:path'

import {
  FileSystem,
  FileSystemCtxOptions,
  FileSystemWriteOptions,
  FileSystemMkDirOptions,
  FileSystemReadOptions,
  WhimbrelError,
  FileSystemScanOptions,
} from '@whimbrel/core-api'

import { AbstractFileSystem } from './abstract'

import { FileSystemReporter } from './reporter'

/**
 * FileSystem-implementation that wraps a concrete implementation, providing
 * reporting facilities.
 */
export class ContextFileSystem extends AbstractFileSystem implements FileSystem {
  constructor(
    public impl: FileSystem,
    private reporter: FileSystemReporter
  ) {
    super()
  }

  async copy(fromPath: string, toPath: string) {
    if (await this.isDirectory(fromPath)) {
      if (!(await this.exists(toPath))) {
        await this.mkdir(toPath)
      }
      const contents = await this.scanDir(fromPath)
      await Promise.all(
        contents.map((e) => this.copy(e.path, path.join(toPath, path.basename(e.path))))
      )
    } else {
      // const toDir = path.dirname(toPath);
      // if (!await this.exists(toDir)) {
      //   this.mkdir(dirPath);
      // }
      await this.impl.copy(fromPath, toPath)
    }
  }

  async delete(filePath: string, opts: FileSystemCtxOptions = {}) {
    await this.impl.delete(filePath)
    this.reporter.fileDeleted(filePath, opts)
  }

  async exists(filePath: string) {
    return await this.impl.exists(filePath)
  }

  async isDirectory(dirPath: string) {
    return await this.impl.isDirectory(dirPath)
  }

  isPhysical() {
    return this.impl.isPhysical()
  }

  async ls(dirPath: string) {
    return this.impl.ls(dirPath)
  }

  async mkdir(dirPath: string, opts: FileSystemMkDirOptions = {}) {
    if (await this.impl.exists(dirPath)) {
      throw new WhimbrelError(`Cannot create directory ${dirPath}. Already exists.`)
    }
    await this.impl.mkdir(dirPath, opts)
    this.reporter.dirCreated(dirPath, opts)
  }

  async mktmpdir(pattern: string): Promise<string> {
    return await this.impl.mktmpdir(pattern)
  }

  async move(sourcePath: string, targetPath: string, opts = {} as FileSystemCtxOptions) {
    const targetExists = await this.impl.exists(targetPath)
    await this.impl.move(sourcePath, targetPath)

    this.reporter.fileCreatedOrModified(targetPath, targetExists, opts)
    this.reporter.fileDeleted(sourcePath, opts)
  }

  async read(filePath: string, encoding: FileSystemReadOptions = 'utf-8') {
    return await this.impl.read(filePath, encoding)
  }

  async scanDir(dirPath: string, opts: FileSystemScanOptions = {}) {
    if (await this.impl.exists(dirPath)) {
      return await this.impl.scanDir(dirPath, opts)
    }
    return []
  }

  async _write(
    filePath: string,
    writeOp: () => Promise<any>,
    opts: FileSystemWriteOptions = {}
  ) {
    const exists = await this.impl.exists(filePath)
    await writeOp()
    this.reporter.fileCreatedOrModified(filePath, exists, opts as FileSystemCtxOptions)
  }

  async write(filePath: string, content: any, opts = {}) {
    await this._write(
      filePath,
      async () => {
        await this.impl.write(filePath, content, opts)
      },
      opts
    )
  }

  async writeReference(filePath: string, absolutePath: string, opts = {}) {
    await this._write(
      filePath,
      async () => {
        await this.impl.writeReference(filePath, absolutePath)
      },
      opts
    )
  }
}

export const makeFileSystem = (impl: FileSystem, reporter?: FileSystemReporter) => {
  return new ContextFileSystem(impl, reporter)
}
