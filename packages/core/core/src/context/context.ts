import {
  ActorId,
  ActorFilter,
  ActorType,
  AcceptMutationHandler,
  WhimbrelContext,
  WhimbrelCommandOptions,
  WhimbrelContextOptions,
  WhimbrelEvent,
  makeNullExecutionStep,
  Formatter,
  defaultJournalEntryHandler,
  defaultMutationHandler,
  AcceptJournalEntryHandler,
  Actor,
} from '@whimbrel/core-api'
import { DefaultFacetRegistry } from '@whimbrel/facet'
import {
  ContextFileSystem,
  DiskFileSystem,
  FileSystemMutationReporter,
} from '@whimbrel/filesystem'
import { makeLogger } from '../log'
import { DefaultFormatter } from '@src/log/formatter'

const getActorByCriteria = (
  coll: Record<ActorId, Actor>,
  criteria: ActorId | ActorFilter
) => {
  if (typeof criteria === 'string') {
    return coll[criteria]
  }

  return Object.values(coll).find((actor) => {
    if (criteria.root && actor.root === criteria.root) return actor
    if (criteria.name && actor.name === criteria.name) return actor
  })
}

/**
 * Factory-function for WhimbrelContext.
 *
 * Creates a WhimbrelContext instance configured according to the
 * provided options.
 *
 * Uses defaults for values not provided.
 *
 * @param contextOptions - Options for the WhimbrelContext.
 * @param commandOptions - Options for the WhimbrelCommand.
 *
 * @return A Promise that resolves to a WhimbrelContext instance.
 */
export const makeWhimbrelContext = async (
  contextOptions: WhimbrelContextOptions,
  commandOptions?: WhimbrelCommandOptions
): Promise<WhimbrelContext> => {
  const {
    log,
    dir,
    cwd,
    facets,
    formatter = DefaultFormatter,
    acceptJournalEntry,
    acceptMutation,
    sources,
    targets,
    memCacheOnly = false,
  } = contextOptions

  commandOptions = commandOptions ?? { prop: {} }

  const ctx: WhimbrelContext = {
    cwd: cwd ?? dir ?? '.',
    disk: contextOptions.disk ?? DiskFileSystem,
    dryRun: false,
    facets: facets ?? new DefaultFacetRegistry(),
    formatter: null as Formatter,
    options: commandOptions,
    log: await makeLogger(commandOptions, log),
    step: makeNullExecutionStep(),
    sources: sources ?? {},
    targets: targets ?? {},
    stepResult: undefined,
    acceptMutation: acceptMutation ?? (null as AcceptMutationHandler),
    acceptJournalEntry: acceptJournalEntry ?? (null as AcceptJournalEntryHandler),
    emitEvent: (_event: WhimbrelEvent) => {},
    getActor(identifier: ActorId | ActorFilter, type?: ActorType): Actor | undefined {
      switch (type) {
        case undefined:
          return getActorByCriteria(
            {
              ...ctx.sources,
              ...ctx.targets,
            },
            identifier
          )
        case 'source':
          return getActorByCriteria(ctx.sources, identifier)
        case 'target':
          return getActorByCriteria(ctx.targets, identifier)
        case 'rootTarget':
          return ctx.rootTarget
            ? getActorByCriteria({ [ctx.rootTarget.id]: ctx.rootTarget }, identifier)
            : undefined
      }
    },
    resetActors: () => {
      ctx.sources = {}
      ctx.targets = {}
      ctx.rootTarget = null
      ctx.target = null
      ctx.source = null
    },
  }

  ctx.formatter = new formatter(ctx)
  ctx.acceptMutation = ctx.acceptMutation ?? defaultMutationHandler(ctx)
  ctx.acceptJournalEntry = ctx.acceptJournalEntry ?? defaultJournalEntryHandler(ctx)
  if (!(ctx.disk instanceof ContextFileSystem)) {
    ctx.disk = new ContextFileSystem(ctx.disk, new FileSystemMutationReporter(ctx))
  }

  return ctx
}
