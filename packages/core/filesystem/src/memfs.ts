import { randomBytes } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'

import {
  FileEntry,
  FileSystem,
  FileSystemFileOptions,
  FileSystemMkDirOptions,
  FileSystemReadOptions,
  FileSystemScanOptions,
  FileSystemWriteOptions,
  WhimbrelError,
} from '@whimbrel/core-api'
import { DiskFileSystem } from './physical'
import { AbstractFileSystem } from './abstract'

interface FileDescriptor {
  content?: string | Buffer
  ref?: string
  timestamp?: Date
}

const split = (filePath: string): [string, string] => {
  return [path.dirname(filePath), path.basename(filePath)]
}

const toFileOpts = (maybeOpts: FileSystemFileOptions | string): FileSystemFileOptions => {
  if (typeof maybeOpts === 'string') {
    return { encoding: maybeOpts } as FileSystemFileOptions
  }
  return maybeOpts as FileSystemFileOptions
}

export class MemoryFileSystem extends AbstractFileSystem implements FileSystem {
  paths: Record<string, Record<string, FileDescriptor>> = {
    '/': {},
  }

  constructor() {
    super()
  }

  async copy(fromPath: string, toPath: string) {
    if (await this.isDirectory(fromPath)) {
      throw new WhimbrelError(
        'MemoryFileSystem.copy called with directory source. Use mkdir.'
      )
    }
    const [fromDir, fromFile] = split(fromPath)
    const [toDir, toFile] = split(toPath)

    const file = structuredClone(this.paths[fromDir][fromFile])
    this.paths[toDir][toFile] = file
  }

  async exists(filePath: string) {
    if (await this.isDirectory(filePath)) {
      return true
    }

    const [dirName, fileName] = split(filePath)

    if (this.paths[dirName]?.[fileName]) {
      return true
    }

    return false
  }

  async isDirectory(filePath: string) {
    if (this.paths[filePath]) {
      return true
    }

    if (Object.keys(this.paths).some((dirPath) => dirPath.startsWith(filePath + '/'))) {
      return true
    }
  }

  isPhysical() {
    return false
  }

  async ls(dirPath: string, opts: { withFileTypes?: boolean } = {}) {
    const { withFileTypes } = opts
    if (dirPath.endsWith('/')) dirPath = dirPath.substring(0, dirPath.length - 1)
    //    dirPath = path.resolve(dirPath);
    const result = []

    const dirEntry = this.paths[dirPath]
    if (dirEntry) {
      const files = Object.keys(dirEntry)
      if (withFileTypes) {
        result.push(...files.map((f) => ({ name: f, type: 'file' })))
      } else {
        result.push(...files)
      }
    }

    const dirPathSlash = dirPath + '/'
    const dirs = Object.keys(this.paths)
      .filter((d) => d.startsWith(dirPathSlash))
      .map((d) => path.relative(dirPathSlash, d).split('/'))
      .filter((d) => d.length === 1 && d[0] !== dirPath)
      .map((d) => d[0])

    if (withFileTypes) {
      result.push(...dirs.map((d) => ({ name: d, type: 'directory' })))
    } else {
      result.push(...dirs)
    }

    return result
  }

  async mkdir(dirPath: string, opts: FileSystemMkDirOptions = { recursive: false }) {
    if (await this.exists(dirPath)) {
      throw new WhimbrelError(`Already exists: (virtual) ${dirPath}`)
    }

    const { recursive } = opts
    let pathExists = false
    let cpath = dirPath
    if (recursive) {
      while (!pathExists) {
        cpath = path.dirname(cpath)
        pathExists = cpath === '.' || this.paths[cpath] != undefined
        if (!pathExists) {
          this.paths[cpath] = {}
        }
      }
    }

    this.paths[dirPath] = {}
  }

  async mktmpdir(pattern: string) {
    const rndPart = randomBytes(3).toString('hex').slice(0, 6)
    const dirPath = path.join(os.tmpdir(), `${pattern}${rndPart}`)
    await this.mkdir(dirPath, { recursive: true })
    return dirPath
  }

  async move(fromPath: string, toPath: string) {
    const [sourceDir, sourceFile] = split(fromPath)
    const [targetDir, targetFile] = split(toPath)
    const file = this.paths[sourceDir][sourceFile]
    if (!file) {
      throw new WhimbrelError(`File not Found: (virtual) ${fromPath}`)
    }
    this.paths[targetDir][targetFile] = file
    delete this.paths[sourceDir][sourceFile]
  }

  async read(filePath: string, opts: FileSystemReadOptions) {
    opts = toFileOpts(opts)
    if (await this.exists(filePath)) {
      const [dirName, fileName] = split(filePath)
      const entry = this.paths[dirName][fileName]
      if (entry.content) {
        return opts.encoding
          ? Buffer.from(entry.content).toString(
              (opts.encoding ?? 'utf8') as BufferEncoding
            )
          : entry.content
      } else if (entry.ref) {
        return await DiskFileSystem.read(entry.ref, opts)
      } else {
        throw new WhimbrelError(
          `MemoryFileSystem entry at ${filePath} container neither content nor reference.`
        )
      }
    }
    throw new WhimbrelError(`File not Found: (virtual) ${filePath}`)
  }

  reset() {
    this.paths = {}
  }

  async scanDir(dirPath: string, opts: FileSystemScanOptions = {}): Promise<FileEntry[]> {
    const { ignorePredicate, filter, depth, sort } = opts
    const depthLimit = typeof depth === 'number'
    const entries = await this.ls(dirPath, { withFileTypes: true })
    const files = []

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const fileEntry = { path: fullPath, type: entry.type }

      if (ignorePredicate && ignorePredicate(fileEntry)) {
        continue
      }

      if (entry.type === 'directory') {
        if (!depthLimit || depth > 0) {
          files.push(
            ...(await this.scanDir(fullPath, {
              ...opts,
              depth: depthLimit ? depth - 1 : null,
            }))
          )
        }
      }

      if (filter && !filter(fileEntry)) continue

      files.push(fileEntry)
    }

    if (sort) files.sort((a, b) => a.path.localeCompare(b.path))

    return files
  }

  async size(filePath: string) {
    if (await this.exists(filePath)) {
      const [dirName, fileName] = split(filePath)
      const entry = this.paths[dirName][fileName]
      if (entry?.content) {
        return entry.content.length
      } else if (entry?.ref) {
        return await DiskFileSystem.size(entry.ref)
      }
    }

    return 0
  }

  async timestamp(filePath: string) {
    if (await this.exists(filePath)) {
      const [dirName, fileName] = split(filePath)
      const entry = this.paths[dirName][fileName]
      if (entry?.content) {
        return entry.timestamp ?? new Date()
      } else {
        return await DiskFileSystem.timestamp(filePath)
      }
    }
  }

  async _write(filePath: string, entry: FileDescriptor) {
    const [dirName, fileName] = split(filePath)
    const dirMap = (this.paths[dirName] ??= {})
    dirMap[fileName] = entry
  }

  async write(
    filePath: string,
    content: string | Buffer,
    opts: FileSystemWriteOptions = { encoding: 'utf8' }
  ) {
    opts = toFileOpts(opts)
    content = Buffer.isBuffer(content)
      ? content
      : Buffer.from(content as string, (opts.encoding || 'utf8') as BufferEncoding)
    await this._write(filePath, { content })
  }

  async importReferences(dirPath: string, scanOpts: FileSystemScanOptions = {}) {
    const importEntries = await DiskFileSystem.scanDir(dirPath, scanOpts)

    const opts = { silent: true, report: false }
    for (const entry of importEntries) {
      if (entry.type === 'file') {
        await this.writeReference(entry.path, entry.path, opts)
      }
    }
  }

  async writeReference(filePath: string, absolutePath: string, _opts?: any) {
    const dirName = path.dirname(filePath)
    if (!(await this.exists(dirName))) {
      await this.mkdir(dirName, { recursive: true })
    }
    await this._write(filePath, { ref: absolutePath })
  }

  async delete(filePath: string) {
    if (await this.exists(filePath)) {
      const [dirName, fileName] = split(filePath)
      delete this.paths[dirName][fileName]
      return
    }
    throw new WhimbrelError(`File not Found: (virtual) ${filePath}`)
  }
}

export const makeMemoryFileSystem = async () => {
  return new MemoryFileSystem()
}
