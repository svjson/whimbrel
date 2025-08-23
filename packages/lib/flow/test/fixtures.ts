import {
  ApplicationLog,
  FacetRegistry,
  FileSystem,
  Formatter,
  JournalEntry,
  makeNullExecutionStep,
  Mutation,
  WhimbrelContext,
  WhimbrelContextOptions,
  WhimbrelEvent,
} from '@whimbrel/core-api'

export const makeWhimbrelContext = (
  opts: WhimbrelContextOptions,
  journal: JournalEntry[] = []
): WhimbrelContext => {
  const ctx: WhimbrelContext = {
    cwd: '',
    dryRun: false,
    disk: undefined as FileSystem,
    facets: undefined as FacetRegistry,
    log: undefined as ApplicationLog,
    formatter: undefined as Formatter,
    sources: {},
    targets: {},
    step: makeNullExecutionStep(),
    options: { prop: {} },
    emitEvent: (event: WhimbrelEvent) => {
      throw new Error(`Unexpected event: ${event}`)
    },
    acceptMutation: (mutation: Mutation) => {
      throw new Error(`Unexpected mutation: ${mutation}`)
    },
    getActor: () => null,
    resetActors: () => null,
    acceptJournalEntry:
      opts.acceptJournalEntry ??
      ((entry: JournalEntry) => {
        journal.push(entry)
      }),
  }

  return ctx
}
