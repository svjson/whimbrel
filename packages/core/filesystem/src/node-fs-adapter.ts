import fs, {
  PathOrFileDescriptor,
  WriteFileOptions,
  NoParamCallback,
  Stats,
} from 'node:fs'

import { FileSystem } from '@whimbrel/core-api'
import { NodeFileSystem } from './types'
import { Abortable } from 'node:events'
import { toEncodingArgument } from './node-fs'
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

    unlink() {
      throw new Error('unlink not implemented')
    },
    readdir() {
      throw new Error('readdir not implemented')
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
      const stat = async (): Promise<Stats> => {
        filePath = path.resolve(filePath)

        if (!(await disk.exists(filePath))) {
          return null
        }
        if (await disk.isDirectory(filePath)) {
          return {
            isFile: () => false,
            isDirectory: () => true,
            isSymbolicLink: () => false,
            size: 0,
            mtimeMs: new Date().getTime(),
            ctimeMs: new Date().getTime(),
          } as Stats
        } else {
          const size = await disk.size(filePath)
          const timestamp = await disk.timestamp(filePath)

          return {
            isFile: () => true,
            isDirectory: () => false,
            isSymbolicLink: () => false,
            size: size,
            mtimeMs: timestamp.getTime(),
            ctimeMs: timestamp.getTime(),
          } as Stats
        }
      }

      stat().then((stats) => {
        callback(null, stats)
      })
    },

    lstat() {
      throw new Error('lstat not implemented')
    },
  }
}
