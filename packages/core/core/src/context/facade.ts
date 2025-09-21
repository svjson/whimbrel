import {
  ApplicationLog,
  FileSystem,
  NullAppender,
  WhimbrelContext,
} from '@whimbrel/core-api'
import {
  ContextFileSystem,
  FileSystemMutationReporter,
  MemoryFileSystem,
  ReadThroughFileSystem,
} from '@whimbrel/filesystem'

/**
 * Wrapper-facade for WhimbrelContext, simplifying re-configuration
 * during the various stages of plan materialization and evolution.
 */
export class ContextOperator {
  originalAppender: ApplicationLog
  originalDisk: FileSystem

  constructor(private ctx: WhimbrelContext) {
    this.originalAppender = ctx.log
    this.originalDisk = ctx.disk
  }

  /**
   * Create and install a new in-memory file system, redirecting
   * subsequent disk operations there.
   */
  useNewInMemoryFileSystem() {
    this.ctx.disk = new ContextFileSystem(
      new MemoryFileSystem(),
      new FileSystemMutationReporter(this.ctx)
    )
  }

  /**
   * Create and install a new read-through in-memory file system,
   * redirecting subsequent disk operations there.
   */
  useNewReadThroughInMemoryFileSystem() {
    this.ctx.disk = new ContextFileSystem(
      new ReadThroughFileSystem(),
      new FileSystemMutationReporter(this.ctx)
    )
  }

  /**
   * Use NullAppender as the context ApplicationLog, effectively
   * disabling console output.
   */
  useNullAppender() {
    this.ctx.log = NullAppender
  }

  /**
   * Restore the appender used before installing a NullAppender.
   */
  restoreAppender() {
    this.ctx.log = this.originalAppender
  }

  /**
   * Restore the FileSystem abstraction used before an in-memory
   * file system was installed.
   */
  restoreFileSystem() {
    this.ctx.disk = this.originalDisk
  }

  /**
   * Set the Dry-Run Semaphore on the context, indicating whether
   * the context is currently being used for a dry-run.
   */
  setDryRun(dryRun: boolean) {
    this.ctx.dryRun = dryRun
  }

  /**
   * Set the Materialization-Run Semaphore on the context, indicating
   * whether the context is currently being used for a materialization run.
   */
  setMaterializationRun(materializationRun: boolean) {
    this.ctx.materializationRun = materializationRun
  }
}
