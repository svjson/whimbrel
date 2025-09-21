import { Mode, ObjectEncodingOptions, OpenMode, PathLike, Stats } from 'node:fs'
import { FileHandle } from 'node:fs/promises'

import {
  FileSystem,
  FileSystemReadOptions,
  FileSystemWriteOptions,
} from '@whimbrel/core-api'
import { NodePromisesFileSystem } from './types'
import { Abortable } from 'node:events'
import { toEncodingArgument } from './node-fs'
import Stream from 'node:stream'
import { makeNodeFsAdapter } from './node-fs-adapter'
import { AbstractFileSystem } from './abstract'

export const makeNodeFsPromisesAdapter = (disk: FileSystem): NodePromisesFileSystem => {
  return {
    promises: {
      async readFile(path: PathLike, options?: FileSystemReadOptions) {
        try {
          return await disk.read(path.toString(), options || {})
        } catch (err: any) {
          if (err.code === 'ENOENT') return null
          throw err
        }
      },

      async writeFile(
        path: PathLike,
        data: string | Buffer,
        options?: FileSystemWriteOptions
      ) {
        return disk.write(path.toString(), data, options)
      },

      async unlink(path: PathLike) {
        return disk.delete(path.toString())
      },

      async readdir(path: PathLike) {
        try {
          return await disk.ls(path.toString())
        } catch (err: any) {
          if (err.code === 'ENOENT') return []
          throw err
        }
      },

      async mkdir(path: PathLike) {
        return disk.mkdir(path.toString(), { recursive: true })
      },

      async rmdir(path: PathLike) {
        return disk.delete(path.toString())
      },

      async stat(path: PathLike) {
        if (!(await disk.exists(path.toString()))) {
          const e: NodeJS.ErrnoException = new Error(
            `ENOENT: no such file or directory, stat '${path}'`
          )
          e.code = 'ENOENT'
          throw e
        }
        const size = await disk.size(path.toString())
        const isFile = !(await disk.isDirectory(path.toString()))
        const isDir = await disk.isDirectory(path.toString())
        return {
          isFile: () => isFile,
          isDirectory: () => isDir,
          size,
          mode: 0o666, // placeholder
          mtime: await disk.timestamp(path.toString()),
          ctime: await disk.timestamp(path.toString()),
        } as Stats
      },

      async lstat(path: PathLike) {
        return this.stat(path)
      },

      async readlink(_path: PathLike) {
        throw new Error('readlink not implemented')
      },

      async symlink(_target: PathLike, _path: PathLike) {
        throw new Error('symlink not implemented')
      },

      async chmod(_path: PathLike, _mode: number) {
        // noop
      },
    },
  }
}
