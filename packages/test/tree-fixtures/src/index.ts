import path from 'node:path'

import { FileSystem, WhimbrelError } from '@whimbrel/core-api'
import { ContextFileSystem, DiskFileSystem } from '@whimbrel/filesystem'

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

const ensureFs = (fsImpl: FileSystem) => {
  if (!fsImpl) fsImpl = DiskFileSystem
  if (fsImpl instanceof ContextFileSystem) {
    fsImpl = fsImpl.impl
  }
  return fsImpl
}

export const createDirectory = async (
  dirSpec: TreeSpecification,
  fsImpl?: FileSystem
) => {
  return await createTree('whim-dir-', dirSpec, fsImpl ?? DiskFileSystem)
}

export const createEmptyDir = async (pattern = 'empty-test', fsImpl: FileSystem) => {
  fsImpl = ensureFs(fsImpl)
  return await fsImpl.mktmpdir(pattern.endsWith('-') ? pattern : `${pattern}-`)
}

const createTree = async (
  pattern: string,
  dirSpec: TreeSpecification,
  fsImpl: FileSystem
) => {
  if (!Array.isArray(dirSpec)) {
    throw new Error('Directory specification is not an array.')
  }

  const rootDir = await createEmptyDir(pattern, fsImpl)

  await populateDirectory(rootDir, dirSpec, fsImpl)

  return rootDir
}

export const populateDirectory = async (
  dir: string,
  dirSpec: TreeSpecification,
  fsImpl: FileSystem
) => {
  fsImpl = ensureFs(fsImpl)

  if (!(await fsImpl.exists(dir))) {
    await fsImpl.mkdir(dir, { recursive: true, report: false })
  }

  if (Array.isArray(dirSpec)) {
    for (const entry of dirSpec) {
      if (typeof entry === 'string') {
        await fsImpl.write(path.join(dir, entry), 'dummy-file', {
          encoding: 'utf8',
          report: false,
        })
      } else if (Array.isArray(entry)) {
        const [dirName, subDirSpec] = entry
        await populateDirectory(path.join(dir, dirName), subDirSpec, fsImpl)
      } else if (typeof entry === 'object') {
        for (const [fileName, contentSpec] of Object.entries(entry)) {
          if (typeof contentSpec === 'object') {
            await fsImpl.writeJson(path.join(dir, fileName), contentSpec, {
              report: false,
            })
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
