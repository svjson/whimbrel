import {
  FileSystemCtxOptions,
  FileSystemMutation,
  WhimbrelContext,
} from '@whimbrel/core-api'
import { FileSystemReporter } from './reporter'

export class FileSystemLogger implements FileSystemReporter {
  constructor(private ctx: WhimbrelContext) {}

  #log(message: string, opts: FileSystemCtxOptions = {}) {
    if (!opts.silent) {
      this.ctx.log.info(message)
    }
  }

  dirCreated(path: string, opts?: FileSystemCtxOptions): void {
    this.#log(` - Create directory ${path}`, opts)
  }
  dirDeleted(path: string, opts?: FileSystemCtxOptions): void {
    throw new Error('Method not implemented.')
  }
  fileCreated(path: string, opts?: FileSystemCtxOptions): void {
    throw new Error('Method not implemented.')
  }
  fileCreatedOrModified(
    path: string,
    modified: boolean,
    opts: FileSystemCtxOptions = {}
  ): void {
    return modified ? this.fileModified(path, opts) : this.fileCreated(path, opts)
  }
  fileDeleted(path: string, opts?: FileSystemCtxOptions): void {
    this.#log(` - Delete ${path}`, opts)
  }
  fileModified(path: string, opts?: FileSystemCtxOptions): void {
    throw new Error('Method not implemented.')
  }
  report(mutation: FileSystemMutation, opts?: FileSystemCtxOptions): void {
    throw new Error('Method not implemented.')
  }
}
