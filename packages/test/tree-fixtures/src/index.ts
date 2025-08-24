import { FileSystem, WhimbrelError } from '@whimbrel/core-api'

import { makeCreateFixtures } from './create'
import { makePopulateFixtures } from './populate'

export const makeTreeFixture = (defaultFileSystem: FileSystem) => {
  const ensureFs = (fsImpl: FileSystem) => {
    if (!fsImpl) fsImpl = defaultFileSystem
    return fsImpl
  }

  const populate = makePopulateFixtures(ensureFs)
  const create = makeCreateFixtures(ensureFs, populate.populateDirectory)
  return {
    ...create,
    ...populate,
  }
}

export default makeTreeFixture
