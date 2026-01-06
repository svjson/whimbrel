import { Command } from 'commander'
import { WhimbrelContext } from '@whimbrel/core-api'
import { executeCommand, withCommonOptions } from './common'
import { makeCLIWhimbrelContext } from '@src/context'

export const addDescribeFacetCommand = (program: Command) => {
  withCommonOptions(
    ['output'],
    program.command('describe-facet <facet-id>').alias('f')
  ).action(async (facetId: string) => {
    executeCommand(
      async () => {
        const context = await makeCLIWhimbrelContext({ prop: {} })
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
