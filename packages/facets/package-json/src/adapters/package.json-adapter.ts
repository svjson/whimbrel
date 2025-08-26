import path from 'node:path'

import { FileSystem, WhimbrelError } from '@whimbrel/core-api'
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
    path: string
    content: string | any
    disk: FileSystem
  }) {
    super({ path, content, storage: disk, keyOrder: PACKAGE_JSON_KEY_ORDER })
  }

  static async read(disk: FileSystem, filePath: string | string[]): Promise<PackageJSON> {
    const actualPath = Array.isArray(filePath) ? path.join(...filePath) : filePath
    if (await disk.exists(actualPath)) {
      return new PackageJSON({
        path: actualPath,
        disk,
        content: await disk.readJson(actualPath),
      })
    }

    throw new WhimbrelError(`package.json file not found: ${actualPath}`)
  }
}
