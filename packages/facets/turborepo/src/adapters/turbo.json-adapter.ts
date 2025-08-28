import path from 'node:path'

import { FileSystem, WhimbrelError } from '@whimbrel/core-api'
import { JSONFile } from '@whimbrel/struct-file'
import { ifFileExistsAt } from '@whimbrel/filesystem'

export class TurboJSON extends JSONFile {
  constructor({
    path = '',
    content,
    disk = null,
  }: {
    path?: string
    content: string | any
    disk?: FileSystem
  }) {
    super({ path, content, storage: disk })
  }

  static async readIfExists(disk: FileSystem, filePath: string | string[]) {
    return await ifFileExistsAt(disk, filePath, 'turbo.json', async (fPath) => {
      return new TurboJSON({
        path: fPath,
        disk,
        content: await disk.readJson(fPath),
      })
    })
  }

  static async read(disk: FileSystem, filePath: string | string[]): Promise<TurboJSON> {
    const pkgJson = await this.readIfExists(disk, filePath)
    if (pkgJson) return pkgJson
    throw new WhimbrelError(
      `turbo.json file not found: ${Array.isArray(filePath) ? path.join(...filePath) : filePath}`
    )
  }
}
