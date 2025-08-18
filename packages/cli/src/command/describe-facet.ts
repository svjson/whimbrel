import path from 'node:path'

import { Command } from 'commander'
import { makeWhimbrelContext } from '@whimbrel/core'
import { makeFacetRegistry } from '@src/facets'
import { ConsoleAppender } from '@src/log/console-appender'
import { WhimbrelContext } from '@whimbrel/core-api'
import { executeCommand } from './common'

export const addDescribeFacetCommand = (program: Command) => {
  program
    .command('describe-facet <facet-id>')
    .alias('f')
    .action(async (facetId: string) => {
      executeCommand(
        async () => {
          const context = await makeWhimbrelContext(
            {
              cwd: process.cwd(),
              dir: path.resolve('.'),
              facets: makeFacetRegistry(),
              log: new ConsoleAppender(),
            },
            { prop: {} }
          )
          await describeFacet(context, facetId)
        },
        { prop: {} }
      )
    })
}

export const describeFacet = async (ctx: WhimbrelContext, facetId: string) => {
  const facetModule = ctx.facets.get(facetId)
  if (!facetModule) {
    ctx.log.info()
    ctx.log.error(`Unrecognized Facet ID: '${facetId}'.`)
  }

  ctx.log.banner('Describe Facet', facetId)
  ctx.log.info()

  ctx.log.info('Tasks:')
  ctx.log.indent()

  Object.keys(facetModule.tasks)
    .sort()
    .forEach((taskId: string) => {
      const task = facetModule.getTask(taskId)
      ctx.log.info(`${taskId} - ${task.name}`)
    })
}
