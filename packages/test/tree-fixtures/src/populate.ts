import path from 'node:path'

import { FileSystem, WhimbrelError } from '@whimbrel/core-api'
import { readAsset } from '@whimbrel/asset-fixtures'

export type DirectorySpecification = [string, TreeSpecification]
export interface DirectoryReferenceSpec {
  dir: string
}

export type FileCollection = Record<string, string | any>

type FileAssetReference<T = string> = {
  [K in string]: { [P in K]: T }
}[string]

export type PlaceholderFile = string

export type TreeSpecification = (
  | DirectorySpecification
  | FileAssetReference
  | FileCollection
  | PlaceholderFile
)[]

export const makePopulateFixtures = (ensureFs: (fs: FileSystem) => FileSystem) => {
  /**
   *
   */
  const createFile = async (
    fsImpl: FileSystem,
    dir: string,
    name: string,
    content: string | any
  ) => {
    await fsImpl.write(
      path.join(dir, name),
      typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      {
        encoding: 'utf8',
        report: false,
      }
    )
  }

  const populateDirectory = async (
    dir: string,
    dirSpec: TreeSpecification,
    fsImpl?: FileSystem
  ) => {
    fsImpl = ensureFs(fsImpl)

    if (!(await fsImpl.exists(dir))) {
      await fsImpl.mkdir(dir, { recursive: true, report: false })
    }

    if (Array.isArray(dirSpec)) {
      for (const entry of dirSpec) {
        if (typeof entry === 'string') {
          await createFile(fsImpl, dir, entry, 'dummy-file')
        } else if (Array.isArray(entry)) {
          const [dirName, subDirSpec] = entry
          await populateDirectory(path.join(dir, dirName), subDirSpec, fsImpl)
        } else if (typeof entry === 'object') {
          for (const [fileName, contentSpec] of Object.entries(entry)) {
            if (Array.isArray(contentSpec)) {
              await fsImpl.write(path.join(dir, fileName), contentSpec.join('\n'), {
                report: false,
              })
            } else if (typeof contentSpec === 'object') {
              await fsImpl.writeJson(path.join(dir, fileName), contentSpec, {
                report: false,
              })
            } else if (typeof contentSpec === 'string') {
              const content = contentSpec.startsWith('@')
                ? await readAsset(contentSpec.slice(1))
                : contentSpec

              await createFile(fsImpl, dir, fileName, content)
            } else {
              throw new WhimbrelError(`Unsupported content: ${contentSpec}`)
            }
          }
        } else {
          throw new WhimbrelError(`Unsupported dir entry: ${entry}`)
        }
      }
    }
  }

  return { populateDirectory }
}
