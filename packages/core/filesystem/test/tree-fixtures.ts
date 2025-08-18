import path from 'node:path'

import { FileSystem, WhimbrelError } from '@whimbrel/core-api'
import { DiskFileSystem } from '@src/index'
import { ContextFileSystem } from '@src/index'

export type DirectorySpecification = [string, TreeSpecification]
export interface DirectoryReferenceSpec {
  dir: string
}

type FileAssetReference<T = string> = {
  [K in string]: { [P in K]: T }
}[string]

export type PlaceholderFile = string

export type TreeSpecification = (
  | DirectorySpecification
  | FileAssetReference
  | PlaceholderFile
)[]

const ensureFs = (fsImpl: FileSystem) => {
  if (!fsImpl) fsImpl = DiskFileSystem
  if (fsImpl instanceof ContextFileSystem) {
    fsImpl = fsImpl.impl
  }
  return fsImpl
}

export const createDirectory = async (dirSpec: TreeSpecification, fsImpl: FileSystem) => {
  return await createTree('whim-dir-', dirSpec, fsImpl)
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
    await fsImpl.mkdir(dir, { recursive: true })
  }

  if (Array.isArray(dirSpec)) {
    for (const entry of dirSpec) {
      if (typeof entry === 'string') {
        await fsImpl.write(path.join(dir, entry), 'dummy-file', 'utf8')
      } else if (Array.isArray(entry)) {
        const [dirName, subDirSpec] = entry
        await populateDirectory(path.join(dir, dirName), subDirSpec, fsImpl)
      } else {
        throw new WhimbrelError(`Unsupported dir entry: ${entry}`)
      }
    }
  }
}
