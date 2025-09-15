import { Mode, ObjectEncodingOptions, OpenMode, PathLike } from 'node:fs'
import { FileHandle } from 'node:fs/promises'

import { FileSystem } from '@whimbrel/core-api'
import { NodePromisesFileSystem } from './types'
import { Abortable } from 'node:events'
import { toEncodingArgument } from './node-fs'
import Stream from 'node:stream'

export const makeNodeFsPromisesAdapter = (disk: FileSystem): NodePromisesFileSystem => {
  return {
    promises: {
      async readFile(
        path: PathLike | FileHandle,
        options:
          | ({
              encoding: BufferEncoding
              flag?: OpenMode | undefined
            } & Abortable)
          | BufferEncoding
      ) {
        if (!path) return Promise.reject()

        return disk.read(path as string, toEncodingArgument(options))
      },

      async writeFile(
        file: PathLike | FileHandle,
        data:
          | string
          | NodeJS.ArrayBufferView
          | Iterable<string | NodeJS.ArrayBufferView>
          | AsyncIterable<string | NodeJS.ArrayBufferView>
          | Stream,
        options?:
          | (ObjectEncodingOptions & {
              mode?: Mode | undefined
              flag?: OpenMode | undefined
              /**
               * If all data is successfully written to the file, and `flush`
               * is `true`, `filehandle.sync()` is used to flush the data.
               * @default false
               */
              flush?: boolean | undefined
            } & Abortable)
          | BufferEncoding
          | null
      ) {
        return disk.write(
          file as string,
          data as string | Buffer,
          toEncodingArgument(options)
        )
      },
      unlink() {
        throw new Error('unlink not implemented')
      },
      readdir() {
        throw new Error('readdir not implemented')
      },
      mkdir() {
        throw new Error('mkdir not implemented')
      },
      rmdir() {
        throw new Error('rmdir not implemented')
      },
      stat() {
        throw new Error('stat not implemented')
      },
      lstat() {
        throw new Error('lstat not implemented')
      },

      readlink() {
        throw new Error('readlink not implemented')
      },
      symlink() {
        throw new Error('symlink not implemented')
      },
      chmod() {
        throw new Error('chmod not implemented')
      },
    },
  }
}
