import path from 'node:path'
import chalk from 'chalk'

import { executeCommand, withCommonOptions } from './common'
import { pushDistinct } from '@whimbrel/array'
import { Actor } from '@whimbrel/core-api'
import {
  analyzePath,
  makeWhimbrelContext,
  WhimbrelContext,
  WhimbrelError,
} from '@whimbrel/core'
import { CLIFormatter, ConsoleAppender } from '@src/output'
import { makeFacetRegistry } from '@src/facets'
import { queryFacets } from '@whimbrel/facet'
import { Command } from 'commander'

/**
 * Defines the Query CLI command.
 *
 * This command performs a full analysis of the specified path/context and
 * then executes the specified query against the resulting context.
 *
 * @param program - The Commander program instance to which the command
 *                  is added.
 */
export const addQueryCommand = (program: Command) => {
  withCommonOptions(
    ['output', 'step-tree', 'property'],
    program
      .command('query [type] [path]')
      .alias('q')
      .option('-a, --actor <actor-id>', 'Narrow query to a specific actor')
  ).action(async (queryName: string, cmdPath: string, options: any) => {
    executeCommand(async () => {
      if (!cmdPath) {
        cmdPath = path.resolve('.')
      }
      const context = await makeWhimbrelContext(
        {
          cwd: process.cwd(),
          dir: cmdPath,
          formatter: CLIFormatter,
          facets: makeFacetRegistry(),
          log: new ConsoleAppender(),
        },
        options
      )
      await runCommand(context, queryName, options.actor, cmdPath)
    })
  })
}

/**
 * Enumerate all available queries for the given actor.
 *
 * Collects all query identifiers exposed by the facets of the
 * provided actor.
 *
 * @param ctx - The Whimbrel context.
 * @param actor - The actor whose facets to enumerate.
 */
const enumerateQueries = (ctx: WhimbrelContext, actor: Actor) => {
  return Object.keys(actor.facets)
    .reduce((queries, facetId) => {
      pushDistinct(queries, ...Object.keys(ctx.facets.get(facetId).queryIndex))
      return queries
    }, [])
    .sort()
}

/**
 * Lookup an actor by ID, or list available actors if none is provided.
 *
 * @param ctx - The Whimbrel context.
 * @param actorId - The ID of the actor to lookup.
 *
 * @return The Actor instance corresponding to the provided ID.
 */
const lookupActor = (ctx: WhimbrelContext, actorId: string): Actor => {
  if (!actorId) {
    ctx.log.info('Actor required. Available:')
    ctx.log.indent()
    for (const actorKey of [...Object.keys(ctx.sources), ...Object.keys(ctx.targets)]) {
      const actor = ctx.getActor(actorKey)
      ctx.log.info(` * ${chalk.white(actorKey)} / ${chalk.blue(actor.name)}`)
      ctx.log.indent()
      for (const queryId of enumerateQueries(ctx, actor)) {
        ctx.log.info(` - ${chalk.green(queryId)}`)
      }
      ctx.log.deindent()
    }
    ctx.log.deindent()
    throw new WhimbrelError('Exiting...')
  } else {
    const actor = ctx.getActor(actorId)
    if (!actor) {
      throw new WhimbrelError(`Unknown actor: '${actorId}'`)
    }
    return actor
  }
}

/**
 * Implementation of the Query command.
 *
 * Analyzes the specified path or current directory for facets and
 * executes the specified query against the resulting context.
 *
 * @param ctx - The Whimbrel context containing configuration and state.
 * @param queryName - The name of the query to execute.
 * @param actorId - Optional ID of the actor to narrow the query to.
 * @param targetDir - The directory to analyze for facets.
 */
export const runCommand = async (
  ctx: WhimbrelContext,
  queryName: string,
  actorId?: string,
  targetDir?: string
) => {
  ctx.log.banner('Analyze path', targetDir)
  await analyzePath(ctx, targetDir)

  ctx.log.info('')
  ctx.log.banner('Query', queryName)
  const actor = lookupActor(ctx, actorId)

  const result = await queryFacets(ctx, actor, {
    type: queryName,
    actor,
  })

  for (const source of result) {
    ctx.log.info(`${source.source}:`)
    console.dir(source.result, { depth: null })
    ctx.log.info('')
  }
}
