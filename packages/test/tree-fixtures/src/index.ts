import { FileSystem } from '@whimbrel/core-api'

import { makeCreateFixtures } from './create'
import { makePopulateFixtures } from './populate'
import { makeGitRepoFixture } from './repository'

/**
 * Create a tree fixture object using the provided default FileSystem
 * implementation.
 *
 * The argument default FileSystem is used as a fallback in case a
 * FileSystem instance is not passed to any of fixture functions provided
 * by the object returned by this method.
 *
 * It should typically always be DiskFileSystem for any global instances.
 *
 * @param defaultFileSystem - The default FileSystem implementation to use.
 *
 * @returns - An object containing methods to create and populate
 *            directories on disk or virtual FileSystem.
 */
export const makeTreeFixture = (defaultFileSystem: FileSystem) => {
  const ensureFs = (fsImpl?: FileSystem) => {
    if (!fsImpl) fsImpl = defaultFileSystem
    return fsImpl
  }

  const populate = makePopulateFixtures(ensureFs)
  const create = makeCreateFixtures(ensureFs, populate.populateDirectory)
  const repo = makeGitRepoFixture(ensureFs, create)
  return {
    ...create,
    ...populate,
    ...repo,
  }
}

/**
 * Create an asset reference for use in tree specifications.
 *
 * @param assetName - The name of the asset.
 *
 * @returns - The asset reference string.
 */
export const asset = (assetName: string) => `@${assetName}`

export default makeTreeFixture
