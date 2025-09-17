import { FileSystem } from '@whimbrel/core-api'
import { TreeSpecification } from './populate'

export const makeCreateFixtures = (
  ensureFs: (fs: FileSystem) => FileSystem,
  populateDirectory: Function
) => {
  const createDirectory = async (dirSpec: TreeSpecification, fsImpl?: FileSystem) => {
    return await createTree('whim-dir-', dirSpec, ensureFs(fsImpl))
  }

  const createEmptyDir = async (pattern = 'empty-test', fsImpl: FileSystem) => {
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

  return {
    createDirectory,
    createEmptyDir,
    createTree,
  }
}

export type CreateDirectoryFixture = ReturnType<typeof makeCreateFixtures>
