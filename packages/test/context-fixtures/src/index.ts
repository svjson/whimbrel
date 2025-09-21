import { WhimbrelCommandOptions, WhimbrelContextOptions } from '@whimbrel/core-api'
import { MemoryFileSystem, ReadThroughFileSystem } from '@whimbrel/filesystem'
import { makeWhimbrelContext } from '@whimbrel/core'

export const makeWhimbrelTestContext = async (
  opts: WhimbrelContextOptions = {},
  cmdOpts: WhimbrelCommandOptions = { prop: {} }
) => {
  return makeWhimbrelContext(
    {
      memCacheOnly: true,
      ...opts,
    },
    {
      ...cmdOpts,
    }
  )
}

export const testIOContext = async () => {
  return makeWhimbrelTestContext({})
}

export const rtMemFsContext = async (opts: WhimbrelContextOptions = {}) => {
  return makeWhimbrelTestContext({
    ...opts,
    disk: new ReadThroughFileSystem(),
  })
}

export const memFsContext = async (opts: WhimbrelContextOptions = {}) => {
  return makeWhimbrelTestContext({
    ...opts,
    disk: new MemoryFileSystem(),
  })
}
