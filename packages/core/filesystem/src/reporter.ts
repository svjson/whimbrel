import {
  FileSystemMutation,
  FsObjectType,
  FileSystemCtxOptions,
  MutationType,
  WhimbrelContext,
} from '@whimbrel/core-api'

export interface FileSystemReporter {
  dirCreated(path: string, opts?: FileSystemCtxOptions): void
  dirDeleted(path: string, opts?: FileSystemCtxOptions): void
  fileCreated(path: string, opts?: FileSystemCtxOptions): void
  fileCreatedOrModified(
    path: string,
    modified: boolean,
    opts?: FileSystemCtxOptions
  ): void
  fileDeleted(path: string, opts?: FileSystemCtxOptions): void
  fileModified(path: string, opts?: FileSystemCtxOptions): void
  report(mutation: FileSystemMutation, opts?: FileSystemCtxOptions): void
}

export class FileSystemMutationReporter implements FileSystemReporter {
  constructor(private ctx: WhimbrelContext) {}

  /**
   * Private convenience function that creates a file system mutation object.
   */
  #fsMutation(mutationType: MutationType, fsType: FsObjectType, path: string) {
    return {
      type: mutationType,
      object: fsType,
      path,
    }
  }

  report(mutation: FileSystemMutation, opts: FileSystemCtxOptions = {}) {
    const { report = true } = opts
    if (report) {
      this.ctx.acceptMutation(mutation)
    }
  }

  dirCreated(path: string, opts: FileSystemCtxOptions = {}) {
    return this.report(this.#fsMutation('create', 'directory', path), opts)
  }

  dirDeleted(path: string, opts: FileSystemCtxOptions = {}) {
    return this.report(this.#fsMutation('delete', 'directory', path), opts)
  }

  fileCreated(path: string, opts: FileSystemCtxOptions = {}) {
    return this.report(this.#fsMutation('create', 'file', path), opts)
  }

  fileCreatedOrModified(
    path: string,
    modified: boolean,
    opts: FileSystemCtxOptions = {}
  ) {
    return modified ? this.fileModified(path, opts) : this.fileCreated(path, opts)
  }

  fileDeleted(path: string, opts: FileSystemCtxOptions = {}) {
    return this.report(this.#fsMutation('delete', 'file', path), opts)
  }

  fileModified(path: string, opts: FileSystemCtxOptions = {}) {
    return this.report(this.#fsMutation('modify', 'file', path), opts)
  }
}
