import {
  ApplicationLog,
  FileSystemMutation,
  Mutation,
  WhimbrelContext,
} from '@whimbrel/core-api'
import { DefaultFacetRegistry } from '@src/index'
import { WhimbrelContextOptions } from '../../core-api/dist/context'

export const makeWhimbrelContext = (opts: WhimbrelContextOptions): WhimbrelContext => {
  const { facets } = opts

  return {
    cwd: '.',
    facets: facets ?? new DefaultFacetRegistry(),
    disk: undefined,
    log: {} as ApplicationLog,
    acceptMutation: function (_mutation: FileSystemMutation): void {
      throw new Error('Function not implemented.')
    },
    options: {},
  }
}
