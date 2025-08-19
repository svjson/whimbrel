import {
  ApplicationLog,
  FileSystemMutation,
  Formatter,
  JournalEntry,
  makeNullExecutionStep,
  WhimbrelContext,
  WhimbrelContextOptions,
  WhimbrelEvent,
} from '@whimbrel/core-api'
import { DefaultFacetRegistry } from '@src/index'

export const makeWhimbrelContext = (opts: WhimbrelContextOptions): WhimbrelContext => {
  const { facets } = opts

  return {
    cwd: '.',
    dryRun: false,
    facets: facets ?? new DefaultFacetRegistry(),
    disk: undefined,
    log: {} as ApplicationLog,
    formatter: null as Formatter,
    emitEvent: (event: WhimbrelEvent) => {
      throw new Error(`Unexpected event: ${JSON.stringify(event)}`)
    },
    acceptJournalEntry: (entry: JournalEntry) => {
      throw new Error(`Unexpected journal entry: ${JSON.stringify(entry)}`)
    },
    acceptMutation: (mutation: FileSystemMutation) => {
      throw new Error(`Unexpected mutation: ${JSON.stringify(mutation)}`)
    },
    options: { prop: {} },
    sources: {},
    step: makeNullExecutionStep(),
    targets: {},
  }
}
