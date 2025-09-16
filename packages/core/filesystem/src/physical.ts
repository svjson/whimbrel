import fs from 'node:fs/promises'
import { Dirent, existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  FileEntry,
  FileSystem,
  FileSystemMkDirOptions,
  FileSystemReadOptions,
  FileSystemScanOptions,
  FileSystemWriteOptions,
  FsObjectType,
  WhimbrelError,
} from '@whimbrel/core-api'
import { trackTmpDir } from './tmpdir'
import { AbstractFileSystem } from './abstract'

const toFSObjectType = (dirent: Dirent): FsObjectType => {
  if (dirent.isDirectory()) {
    return 'directory'
  } else if (dirent.isFile()) {
    return 'file'
  }
  return 'file'
}

export class PhysicalFileSystem extends AbstractFileSystem implements FileSystem {
  async copy(fromPath: string, toPath: string) {
    if (await this.isDirectory(fromPath)) {
      throw new WhimbrelError(
        'DiskFileSystem.copy called with directory source. Use mkdir.'
      )
    }
    await fs.copyFile(fromPath, toPath)
  }

  async delete(filePath: string) {
    await fs.rm(filePath)
  }

  async exists(filePath: string) {
    return existsSync(filePath)
  }

  async isDirectory(dirPath: string) {
    const stat = await fs.stat(dirPath)
    return stat.isDirectory()
  }

  isPhysical() {
    return true
  }

  async read(filePath: string, opts: FileSystemReadOptions = 'utf-8') {
    try {
      return await fs.readFile(filePath, opts as any)
    } catch (e) {
      console.error(filePath)
      throw e
    }
  }

  async ls(dirPath: string) {
    return await fs.readdir(dirPath)
  }

  async mkdir(dirPath: string, opts: FileSystemMkDirOptions) {
    const { recursive = false } = opts
    return await fs.mkdir(dirPath, { recursive })
  }

  async mktmpdir(pattern: string) {
    const result = await fs.mkdtemp(path.join(os.tmpdir(), pattern))
    trackTmpDir(result)
    return result
  }

  async move(fromPath: string, toPath: string) {
    await fs.rename(fromPath, toPath)
  }

  async sizeOf(filePath: string) {
    return (await fs.stat(filePath)).size
  }

  async timestamp(filePath: string) {
    return new Date((await fs.stat(filePath)).mtimeMs)
  }

  async write(
    filePath: string,
    content: string | Buffer,
    opts: FileSystemWriteOptions = { encoding: 'utf8' }
  ) {
    await fs.writeFile(filePath, content, opts as any)
  }

  writeReference(_filePath: string, _absolutePath: string, _opts?: {}): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async scanDir(dirPath: string, opts: FileSystemScanOptions = {}): Promise<FileEntry[]> {
    const { ignorePredicate, filter, depth, sort } = opts
    const depthLimit = typeof depth === 'number'
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const files: FileEntry[] = []

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const fileEntry: FileEntry = { path: fullPath, type: toFSObjectType(entry) }

      if (ignorePredicate && ignorePredicate(fileEntry)) {
        continue
      }

      if (entry.isDirectory()) {
        if (!depthLimit || depth > 0) {
          files.push(
            ...(await this.scanDir(fullPath, {
              ...opts,
              depth: depthLimit ? depth - 1 : null,
            }))
          )
        }
      }

      if (filter && !filter(fileEntry as FileEntry)) continue

      files.push(fileEntry)
    }

    if (sort) files.sort((a, b) => a.path.localeCompare(b.path))
    return files
  }
}

export const DiskFileSystem = new PhysicalFileSystem()
