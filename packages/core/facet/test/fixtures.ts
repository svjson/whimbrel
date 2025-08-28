import {
  ActorId,
  ActorType,
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

  const ctx: WhimbrelContext = {
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
    resetActors: () => {
      ctx.sources = {}
      ctx.targets = {}
      ctx.rootTarget = null
      ctx.target = null
      ctx.source = null
    },
    getActor: (id: ActorId, type?: ActorType) => undefined,
  }

  return ctx
}
