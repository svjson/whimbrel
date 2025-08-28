import path from 'node:path'

import { FileSystem, WhimbrelError } from '@whimbrel/core-api'
import { ifFileExistsAt } from '@whimbrel/filesystem'
import { ALPHA, COLLECT_UNKNOWN, JSONFile, KeyOrder } from '@whimbrel/struct-file'

const PACKAGE_JSON_KEY_ORDER: KeyOrder = [
  'name',
  'version',
  'type',
  'private',
  'description',
  'license',
  'homepage',
  'repository',
  'bugs',
  'author',
  'contributors',
  'packageManager',
  'engines',
  'workspaces',
  'main',
  'module',
  'types',
  'files',
  'bin',
  COLLECT_UNKNOWN,
  ['scripts', ALPHA],
  ['peerDependencies', ALPHA],
  ['dependencies', ALPHA],
  ['devDependencies', ALPHA],
] as const

export class PackageJSON extends JSONFile {
  constructor({
    path,
    content,
    disk,
  }: {
    path?: string
    content: string | any
    disk?: FileSystem
  }) {
    super({ path, content, storage: disk, keyOrder: PACKAGE_JSON_KEY_ORDER })
  }

  hasDependency(dependency: string) {
    return (
      Object.keys(this.get('dependencies', {})).includes(dependency) ||
      Object.keys(this.get('devDependencies', {})).includes(dependency) ||
      Object.keys(this.get('peerDependencies', {})).includes(dependency)
    )
  }

  static async readIfExists(disk: FileSystem, filePath: string | string[]) {
    return await ifFileExistsAt(disk, filePath, 'package.json', async (fPath) => {
      return new PackageJSON({
        path: fPath,
        disk,
        content: await disk.readJson(fPath),
      })
    })
  }

  static async read(disk: FileSystem, filePath: string | string[]): Promise<PackageJSON> {
    const pkgJson = await this.readIfExists(disk, filePath)
    if (pkgJson) return pkgJson
    throw new WhimbrelError(
      `package.json file not found: ${Array.isArray(filePath) ? path.join(...filePath) : filePath}`
    )
  }
}
