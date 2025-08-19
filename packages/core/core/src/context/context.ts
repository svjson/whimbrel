import {
  AcceptMutationHandler,
  WhimbrelContext,
  WhimbrelCommandOptions,
  WhimbrelContextOptions,
  WhimbrelEvent,
  makeNullExecutionStep,
  Formatter,
  defaultMutationHandler,
} from '@whimbrel/core-api'
import { DefaultFacetRegistry } from '@whimbrel/facet'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { makeLogger } from '../log'
import { DefaultFormatter } from '@src/log/formatter'

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
    acceptMutation,
    memCacheOnly = false,
  } = contextOptions

  commandOptions = commandOptions ?? { prop: {} }

  const ctx = {
    cwd: cwd ?? dir ?? '.',
    disk: contextOptions.disk ?? DiskFileSystem,
    dryRun: false,
    facets: facets ?? new DefaultFacetRegistry(),
    formatter: null as Formatter,
    options: commandOptions,
    log: await makeLogger(commandOptions, log),
    step: makeNullExecutionStep(),
    sources: {},
    targets: {},
    stepResult: undefined,
    acceptMutation: acceptMutation ?? (null as AcceptMutationHandler),
    emitEvent: (event: WhimbrelEvent) => {},
  }

  ctx.formatter = new formatter(ctx)
  ctx.acceptMutation = ctx.acceptMutation ?? defaultMutationHandler(ctx)

  return ctx
}
