import { FileSystem, WhimbrelError } from '@whimbrel/core-api'

import { makeCreateFixtures } from './create'
import { makePopulateFixtures } from './populate'
import { makeGitRepoFixture } from './repository'

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

export default makeTreeFixture
