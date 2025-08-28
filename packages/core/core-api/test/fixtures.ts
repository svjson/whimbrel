import {
  Actor,
  ActorFilter,
  ActorId,
  ActorType,
  FacetRegistry,
  FileSystem,
  Formatter,
  JournalEntry,
  makeNullExecutionStep,
  Mutation,
  NullAppender,
  WhimbrelCommandOptions,
  WhimbrelContext,
  WhimbrelContextOptions,
  WhimbrelEvent,
} from '@src/index'

export const makeTestContext = (
  ctxOpts: WhimbrelContextOptions = {},
  cmdOpts: WhimbrelCommandOptions = { prop: {} },
  mutations: Mutation[] = [],
  journal: JournalEntry[] = [],
  events: WhimbrelEvent[] = []
): WhimbrelContext => {
  const ctx: WhimbrelContext = {
    cwd: '',
    disk: {} as FileSystem,
    dryRun: false,
    facets: {} as FacetRegistry,
    formatter: {} as Formatter,
    log: NullAppender,
    sources: ctxOpts.sources ?? {},
    targets: ctxOpts.targets ?? {},
    step: makeNullExecutionStep(),
    options: cmdOpts,
    getActor: function (
      actorId: ActorId | ActorFilter,
      type?: ActorType
    ): Actor | undefined {
      switch (type) {
        case 'source':
          return ctx.sources[actorId as ActorId]
        case 'target':
          return ctx.targets[actorId as ActorId]
      }
      return undefined
    },
    emitEvent: function (event: WhimbrelEvent): void {
      events.push(event)
    },
    acceptMutation: function (mutation: Mutation): void {
      mutations.push(mutation)
    },
    acceptJournalEntry: function (entry: JournalEntry): void {
      journal.push(entry)
    },
    resetActors: function (): void {
      throw new Error('Function not implemented.')
    },
  }
  return ctx
}
