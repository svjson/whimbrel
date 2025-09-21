import path from 'node:path'
import { closestAncestor, writePath } from '@whimbrel/walk'
import { MemoryFileSystem, FileDescriptor } from './memfs'
import { DiskFileSystem } from './physical'
import { FileEntry, LsOptions } from '@whimbrel/core-api'
import { includesEqual } from '@whimbrel/array'

type GraveyardDir = {
  [name: string]: boolean | GraveyardDir
}

type LsImpl = (dirPath: string, opts?: LsOptions) => Promise<string[] | FileEntry[]>

export class ReadThroughFileSystem extends MemoryFileSystem {
  /**
   * Mirrored file system status that expresses a hierarchy for deleted nodes,
   * where read-through will be blocked.
   */
  graveyard: GraveyardDir = {}

  /**
   * Override of MemoryFileSystem function that will lazily create file
   * descriptors for non-existing files that exist in the underlying
   * filesystem, unless the path exists in the "graveyeard", meaning that
   * it has been deleted in the MemoryFileSystem.
   */
  override async readFileDescriptor(
    filePath: string
  ): Promise<FileDescriptor | undefined> {
    const memFsDescriptor = await super.readFileDescriptor(filePath)
    if (memFsDescriptor) {
      return memFsDescriptor
    }

    if (this.isGraveyardPath(filePath)) {
      return undefined
    }

    if (await DiskFileSystem.isFile(filePath)) {
      await this.writeReference(filePath, filePath)
    }

    return super.readFileDescriptor(filePath)
  }

  /**
   * Deletes file from the MemoryFileSystem and raises a tombstone.
   */
  override async delete(filePath: string): Promise<void> {
    await super.delete(filePath)
    this.raiseTombstone(filePath)
  }

  override async isDirectory(diskPath: string): Promise<boolean> {
    const existsMemFs = await super.isDirectory(diskPath)
    if (existsMemFs) return true

    if (!this.isGraveyardPath(diskPath)) {
      return await DiskFileSystem.isDirectory(diskPath)
    }

    return false
  }

  async ls(dirPath: string): Promise<string[]>
  async ls(dirPath: string, opts: { withFileTypes: true }): Promise<FileEntry[]>
  async ls(dirPath: string, opts?: LsOptions): Promise<string[] | FileEntry[]> {
    const entries = await (super.ls as LsImpl)(dirPath, opts)
    if (this.isGraveyardPath(dirPath)) return entries
    if (!DiskFileSystem.isDirectory(dirPath)) return entries

    const fsEntries = await (DiskFileSystem.ls as LsImpl)(dirPath, opts)

    for (const entry of fsEntries) {
      if (
        !includesEqual(entries, entry) &&
        !this.isGraveyardPath(
          typeof entry === 'string' ? path.join(dirPath, entry) : entry.path
        )
      ) {
        ;(entries as any[]).push(entry)
      }
    }

    return entries
  }

  private raiseTombstone(diskPath: string) {
    const pathSegments = diskPath.split(path.delimiter)
    writePath(this.graveyard, pathSegments, true)
  }

  override async rmdir(dirPath: string) {
    await super.rmdir(dirPath)
    this.raiseTombstone(dirPath)
  }

  private isGraveyardPath(diskPath: string) {
    const pathSegments = diskPath.split(path.delimiter)
    const graveyardAncestor = closestAncestor(this.graveyard, pathSegments)
    return Boolean(graveyardAncestor.length)
  }
}
