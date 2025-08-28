import path from 'node:path'
import { FileSystem } from '@whimbrel/core-api'

export { ContextFileSystem } from './context'
export { DiskFileSystem, PhysicalFileSystem } from './physical'
export { MemoryFileSystem } from './memfs'
export { FileSystemReporter, FileSystemMutationReporter } from './reporter'

export const ifFileExistsAt = async <T>(
  disk: FileSystem,
  filePath: string | string[],
  fileName: string,
  fn: (fPath: string) => Promise<T>
) => {
  let actualPath = Array.isArray(filePath) ? path.join(...filePath) : filePath
  if (path.basename(actualPath) !== fileName) {
    actualPath = path.join(actualPath, fileName)
  }

  if (await disk.exists(actualPath)) {
    return fn(actualPath)
  }
}
