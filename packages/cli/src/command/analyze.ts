import path from 'node:path'

import { Command } from 'commander'
import { WhimbrelContext } from '@whimbrel/core-api'
import {
  makeAnalyzeScaffold,
  makeRunner,
  makeWhimbrelContext,
  materializePlan,
} from '@whimbrel/core'

import { executeCommand, withCommonOptions } from './common'
import { CLIFormatter, ConsoleAppender } from '@src/output'
import { makeFacetRegistry } from '@src/facets'

/**
 * Defines the Analyze CLI command.
 *
 * This command analyzes the specified path or current directory
 * and outputs details about identified facets.
 */
export const addAnalyzeCommand = (program: Command) => {
  withCommonOptions(
    program
      .command('analyze [path]')
      .alias('z')
      .option('-i, --facet-info <facet>', 'Output details of a specific facet')
      .option('-t, --show-step-ids', 'Output Step ID for each step')
  ).action(async (cmdPath: string, options: any) => {
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
      await analyzePath(context, cmdPath)
    }, options)
  })
}

/**
 * Implementation of the Analyze command.
 *
 * Analyzes the specified path or current directory for facets and
 * materializes a plan based on the detected facets.
 *
 * @param ctx - The Whimbrel context containing configuration and state.
 * @param targetDir - The directory to analyze for facets.
 */
export const analyzePath = async (ctx: WhimbrelContext, targetDir: string) => {
  ctx.log.banner('Analyze path', targetDir)

  const blueprint = makeAnalyzeScaffold(targetDir)
  const plan = await materializePlan(ctx, blueprint)
  const runner = makeRunner(ctx, plan)
  await runner.run()
}
