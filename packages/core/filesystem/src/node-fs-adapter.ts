import fs, {
  PathLike,
  PathOrFileDescriptor,
  WriteFileOptions,
  NoParamCallback,
  Stats,
} from 'node:fs'

import { FileSystem } from '@whimbrel/core-api'
import { NodeFileSystem } from './types'
import { Abortable } from 'node:events'
import { makeEnoentError, toEncodingArgument } from './node-fs'
import path from 'node:path'

export const makeNodeFsAdapter = (disk: FileSystem): NodeFileSystem => {
  return {
    readFile(
      path: PathOrFileDescriptor,
      options:
        | ({
            encoding?: null | undefined
            flag?: string | undefined
          } & Abortable)
        | undefined
        | null,
      callback: (err: NodeJS.ErrnoException | null, data: NonSharedBuffer) => void
    ): void {
      if (!path) throw new TypeError('Cannot read undefined')
      disk
        .read(path as string, {
          ...toEncodingArgument(options),
        })
        .then((data) => {
          callback(null, data as NonSharedBuffer)
        })
        .catch((err) => {
          callback(err, null)
        })
    },

    writeFile(
      file: PathOrFileDescriptor,
      data: string | NodeJS.ArrayBufferView,
      options: WriteFileOptions,
      callback: NoParamCallback
    ): void {
      disk
        .write(file as string, data as string | Buffer, {
          ...toEncodingArgument(options),
        })
        .then(() => {
          callback(null)
        })
    },

    exists(dPath: PathLike, callback: (exists: boolean) => void): void {
      disk.exists(dPath as string).then(callback)
    },

    unlink() {
      throw new Error('unlink not implemented')
    },
    readdir(dirPath: string, callback: (files: string[]) => void): void {
      disk.ls(dirPath).then((files) => callback(files))
    },
    readlink() {
      throw new Error('readlink not implemented')
    },
    symlink() {
      throw new Error('readlink not implemented')
    },
    mkdir() {
      throw new Error('mkdir not implemented')
    },
    rmdir() {
      throw new Error('rmdir not implemented')
    },
    stat(
      filePath: string,
      callback: (err: NodeJS.ErrnoException | null, stats: Stats) => void
    ) {
      const stat = async (): Promise<
        [err: NodeJS.ErrnoException | null, stats: Stats]
      > => {
        filePath = path.resolve(filePath)

        if (!(await disk.exists(filePath))) {
          return [makeEnoentError(filePath, 'stat'), null]
        }
        if (await disk.isDirectory(filePath)) {
          return [
            null,
            {
              isFile: () => false,
              isDirectory: () => true,
              isSymbolicLink: () => false,
              size: 0,
              mtimeMs: new Date().getTime(),
              ctimeMs: new Date().getTime(),
            } as Stats,
          ]
        } else {
          const size = await disk.size(filePath)
          const timestamp = await disk.timestamp(filePath)

          return [
            null,
            {
              isFile: () => true,
              isDirectory: () => false,
              isSymbolicLink: () => false,
              size: size,
              mtimeMs: timestamp.getTime(),
              ctimeMs: timestamp.getTime(),
            } as Stats,
          ]
        }
      }

      stat().then((result) => {
        callback(...result)
      })
    },

    lstat(
      filePath: string,
      callback: (err: NodeJS.ErrnoException | null, stats: Stats) => void
    ) {
      return this.stat(filePath, callback)
    },
  }
}
