import { Mutation, WhimbrelContext, WhimbrelContextOptions } from '@whimbrel/core-api'

export const makeWhimbrelContext = (opts: WhimbrelContextOptions): WhimbrelContext => {
  return {
    cwd: '',
    disk: undefined,
    facets: undefined,
    log: undefined,
    options: undefined,
    acceptMutation: function (mutation: Mutation): void {
      throw new Error('Function not implemented.')
    },
  }
}
